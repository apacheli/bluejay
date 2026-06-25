import { watch } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const isWindows = process.platform === "win32";

const readFiles = async (dir, prefix, files) => {
  const dirents = await readdir(dir, {
    recursive: true,
    withFileTypes: true,
  });
  for (const dirent of dirents) {
    if (dirent.isFile()) {
      const path = join(dirent.path, dirent.name);
      const url = join("/", prefix, relative(dir, path));
      files.push({
        path,
        url: isWindows ? url.split("\\").join("/") : url,
      });
    }
  }
};

const transform = async (options) => {
  const files = [];

  {
    const p = [];
    for (const prefix in options.map) {
      options.map[prefix].map((dir) => p.push(readFiles(join(options.meta.dir, dir), prefix, files)));
    }
    await Promise.all(p);
  }

  files.sort((a, b) => a.url.localeCompare(b.url));

  for (const plugin of options.plugins) {
    if (typeof plugin === "function") {
      await Promise.all(files.map((file) => plugin(file, files)));
      continue;
    }
    const filtered = files.filter((file) => plugin.filter(file, files));
    await Promise.all(filtered.map((file) => plugin.use(file, files)));
  }

  return files;
};

const build = async (options) => {
  const files = await transform(options);
  await Promise.all(files.map((file) => Bun.write(join(options.dist, file.url), file.content ?? Bun.file(file.path))));
};

const _script = `const connect = (reload) => {
  const ws = new WebSocket("/_bluejay/ws/server");

  ws.onopen = () => {
    console.log("Connected to server.");
    if (reload) {
      location.reload();
    }
  };

  ws.onmessage = (event) => {
    if (event.data === "BLUEJAY_RELOAD") {
      location.reload();
    }
  };

  ws.onclose = (event) => {
    if (event.code === 1001) {
      return;
    }
    console.log("Disconnected from server. Reconnecting...");
    setTimeout(connect, 5_000, true);
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
    const response = new Response(file.content ?? Bun.file(file.path), {
      headers: {
        "Content-Type": Bun.file(file.url).type,
      },
    });
    routes[file.url] = response;
    if (file.url.endsWith(".html")) {
      routes[file.url.slice(0, -5)] ??= response;
    }
  }
  routes["/"] = routes["/index.html"];
  if (options.dev) {
    routes["/_bluejay/ws/client"] = BLUEJAY_WS_CLIENT;
    routes["/_bluejay/ws/server"] = BLUEJAY_WS_SERVER;
  }
  routes["/*"] = options.notFound !== undefined ? routes[options.notFound] : new Response(NotFoundPage(files), {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
    },
    status: 404,
  });
  return routes;
};

const ErrorPage = (error) => {
  const msg = Bun.escapeHTML(`${error.name}: ${error.message}`);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${msg}</title>
    <style>body{background-color:#000;color:#fff;font-family:sans-serif}a{color:turquoise}</style>
  </head>
  <body>
    <div>
      <h1>${msg}</h1>
      <pre><code>${Bun.escapeHTML(Bun.inspect(error))}</code></pre>
    </div>
    <script src="/_bluejay/ws/client"></script>
  </body>
</html>
`;
};

const NotFoundPage = (files) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>404 Not Found</title>
    <style>body{background-color:#000;color:#fff;font-family:sans-serif}a{color:turquoise}</style>
  </head>
  <body>
    <div>
      <h1>404 Not Found</h1>
      <ul>${files.map((f) => `<li><a href="${f.url}">${f.url}</a></li>`).join("")}</ul>
    </div>
    <script src="/_bluejay/ws/client"></script>
  </body>
</html>
`;
};

const _error = (error, options) => {
  console.error(error);
  if (!options.dev) {
    return {
      "/*": new Response("500 Internal Server Error", { status: 500 }),
    };
  }
  const response = new Response(ErrorPage(error), {
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
  delete require.cache[join(ctx.options.meta.dir, filename)];
  for (const path in require.cache) {
    if (path.startsWith(ctx.options.meta.dir)) {
      delete require.cache[path];
    }
  }
  const mod = await import(ctx.options.meta.filename);
  ctx.options = mod.default;
  ctx.watcher.close();
  startWatcher(ctx);
  ctx.server.reload({
    routes: await getRoutes(ctx.options).catch((e) => _error(e, ctx.options)),
  });
  ctx.server.publish("bluejay", "BLUEJAY_RELOAD");
};

const startWatcher = (ctx) => {
  let timeout;
  ctx.watcher = watch(ctx.options.meta.dir, {
    recursive: true,
  }, (_, filename) => {
    clearTimeout(timeout);
    timeout = setTimeout(handleWatch, 100, filename, ctx);
  });
};

const start = (cmd, options) => {
  switch (cmd) {
    case "build": {
      return build(options);
    }

    case "serve": {
      return serve(options);
    }
  }

  throw new Error(`${cmd}: command not found`);
};

export { build, serve, start, transform };
