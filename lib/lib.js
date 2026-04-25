import { watch } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { render } from "@apacheli/jsx";

const isWindows = process.platform === "win32";

const readFiles = async (dir, prefix, files) => {
  const dirents = await readdir(dir, {
    recursive: true,
    withFileTypes: true,
  });
  for (const dirent of dirents) {
    if (dirent.isFile()) {
      const path = join(dirent.path, dirent.name);
      files.push({
        path,
        dist: join("/", prefix, relative(dir, path)),
      });
    }
  }
};

const transform = async (options) => {
  const files = [];

  {
    const p = [];
    for (const prefix in options.map) {
      options.map[prefix].map((dir) =>
        p.push(readFiles(join(options.src, dir), prefix, files))
      );
    }
    await Promise.all(p);
  }

  for (const plugin of options.plugins) {
    if (typeof plugin === "function") {
      await Promise.all(files.map((file) => plugin(file, files)));
      continue;
    }
    if (plugin.once !== undefined) {
      await plugin.once(files);
      continue;
    }
    const filtered = files.filter((file) => plugin.filter.test(file.dist));
    for (const use of plugin.use) {
      await Promise.all(filtered.map((file) => use(file, files)));
    }
  }

  return files;
};

const build = async (options) => {
  const files = await transform(options);
  await Promise.all(
    files.map((file) =>
      Bun.write(
        join(options.dist, file.dist),
        file.content ?? Bun.file(file.path),
      )
    ),
  );
};

const _script = `const connect = (reload) => {
    const ws = new WebSocket("/_bluejay/ws/server");

    ws.onopen = () => {
        if (reload) {
            location.reload();
        }
        console.log("Connected to server.");
    };

    ws.onmessage = (event) => {
        if (event.data === "BLUEJAY_RELOAD") {
            location.reload();
        }
    };

    ws.onclose = (event) => {
        console.log("Disconnected from server. Reconnecting...");
        setTimeout(connect, 1_000, true);
    };
};

connect(false);
`;
const BLUEJAY_WS_CLIENT = new Response(_script, {
  headers: {
    "Content-Type": "text/javascript;charset=utf-8",
  },
});

const BLUEJAY_WS_SERVER = (request, server) => {
  if (server.upgrade(request)) {
    return;
  }
  return new Response(null, { status: 404 });
};

const getRoutes = async (options) => {
  const files = await transform(options);
  const routes = {};
  for (const file of files) {
    const route = isWindows ? file.dist.split("\\").join("/") : file.dist;
    const response = new Response(file.content ?? Bun.file(file.path), {
      headers: {
        "Content-Type": Bun.file(file.dist).type,
      },
    });
    routes[route] = response;
    if (route.endsWith(".html")) {
      routes[route.slice(0, -5)] = response;
    }
  }
  routes["/"] = routes["/index"] ?? routes["/index.html"];
  if (options.dev) {
    routes["/_bluejay/ws/client"] = BLUEJAY_WS_CLIENT;
    routes["/_bluejay/ws/server"] = BLUEJAY_WS_SERVER;
  }
  return routes;
};

const ErrorLayout = ({ error }) => {
  const msg = `${error.name}: ${error.message}`;
  return (
    <html lang="en">
      <head>
        <title>{msg}</title>
      </head>
      <body>
        <div>
          <h1>{msg}</h1>
          <pre>
            <code>{Bun.inspect(error)}</code>
          </pre>
        </div>
        <script src="/_bluejay/ws/client" />
      </body>
    </html>
  );
};

const _error = (error, options) => {
  console.error(error);
  if (!options.dev) {
    return {
      "/*": new Response("500 Internal Server Error", { status: 500 }),
    };
  }
  const response = new Response(render(<ErrorLayout error={error} />), {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
    },
    status: 500,
  });
  return {
    "/_bluejay/ws/client": BLUEJAY_WS_CLIENT,
    "/_bluejay/ws/server": BLUEJAY_WS_SERVER,
    "/*": response,
  };
};

const serve = async (options) => {
  const opts = {
    routes: await getRoutes(options).catch((e) => _error(e, options)),
    port: options.port,
  };
  if (!options.dev) {
    return {
      options,
      server: Bun.serve(opts),
      watcher: null,
    };
  }
  opts.websocket = {
    open: (ws) => {
      console.log("Connection opened.");
      ws.subscribe("bluejay");
    },
  };
  const ctx = {
    options,
    server: Bun.serve(opts),
    watcher: null,
  };
  startWatcher(ctx);
  return ctx;
};

const handleWatch = async (filename, ctx) => {
  delete require.cache[join(ctx.options.src, filename)];
  for (const path in require.cache) {
    if (path.startsWith(ctx.options.src)) {
      delete require.cache[path];
    }
  }
  const mod = await import(ctx.options.file);
  ctx.options = mod.default;
  ctx.watcher.close();
  startWatcher(ctx);
  ctx.server.reload({
    routes: await getRoutes(ctx.options).catch((e) => _errors(e, ctx.options)),
  });
  ctx.server.publish("bluejay", "BLUEJAY_RELOAD");
};

const startWatcher = (ctx) => {
  let timeout;
  ctx.watcher = watch(ctx.options.src, {
    recursive: true,
  }, (_, filename) => {
    clearTimeout(timeout);
    timeout = setTimeout(handleWatch, 50, filename, ctx);
  });
};

const start = (options) => {
  switch (options.cmd) {
    case "build": {
      return build(options);
    }

    case "serve": {
      return serve(options);
    }
  }

  throw new Error(`${options.cmd}: command not found`);
};

export { build, serve, start, transform };
