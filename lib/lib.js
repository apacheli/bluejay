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
  const promises = [];
  for (const prefix in options.map) {
    for (const dir of options.map[prefix]) {
      promises.push(readFiles(join(options.meta.dir, dir), prefix, files));
    }
  }
  await Promise.all(promises);
  const context = {
    options,
    files,
  };
  for (const plugin of options.plugins) {
    await plugin(context);
  }
  return files;
};

const build = async (options) => {
  const files = await transform(options);
  return Promise.all(files.map((file) => Bun.write(join(options.dist, file.url), file.content ?? Bun.file(file.path))));
};

const ErrorPage = (error) => {
  const msg = Bun.escapeHTML(`${error.name}: ${error.message}`);
  const s = `<!DOCTYPE html>
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
  return new Response(s, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
    },
    status: 500,
  });
};

const NotFoundPage = (options, files) => {
  if (!options.dev) {
    return new Response("404 Not Found", { status: 404 });
  }
  const s = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>404 Not Found</title>
    <style>body{background-color:#000;color:#fff;font-family:sans-serif}a{color:turquoise}</style>
  </head>
  <body>
    <div>
      <h1>404 Not Found</h1>
      <p>You can set <code>options.notFound</code> if you want a custom 404 page.</p>
      <ul>${files.map((f) => `<li><a href="${f.url}">${f.url}</a></li>`).join("")}</ul>
    </div>
    <script src="/_bluejay/ws/client"></script>
  </body>
</html>
`;
  return new Response(s, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
    },
    status: 404,
  });
};

const _s = `(() => {
  const MAX_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5_000;
  const PING_INTERVAL = 15_000;

  const connect = (reload, attempts) => {
    const ws = new WebSocket("/_bluejay/ws/server");
    let interval;

    ws.onopen = () => {
      console.log("Connected to server.");
      if (reload) {
        location.reload();
        return;
      }
      attempts = 0;
      interval = setInterval(() => ws.send("ping"), PING_INTERVAL);
    };

    ws.onmessage = (event) => {
      if (event.data === "BLUEJAY_RELOAD") {
        location.reload();
      }
    };

    ws.onclose = (event) => {
      clearInterval(interval);
      attempts++;
      if (event.code === 1001 || attempts > MAX_ATTEMPTS) {
        return;
      }
      console.log(\`Disconnected from server. Reconnecting... (\${attempts}/\${MAX_ATTEMPTS})\`);
      setTimeout(connect, RECONNECT_DELAY, true, attempts);
    };
  };

  connect(false, 0);
})();`;

const BLUEJAY_WS_CLIENT = new Response(_s, {
  headers: {
    "Content-Type": "text/javascript;charset=utf-8",
  },
});

const BLUEJAY_WS_SERVER = (request, server) => {
  if (server.upgrade(request)) {
    return;
  }
  return new Response("400 Bad Request", { status: 400 });
};

const getRoutes = async (options) => {
  let files;
  try {
    files = await transform(options);
  } catch (e) {
    if (!options.dev) {
      throw e;
    }
    console.error(e);
    return {
      "/_bluejay/ws/client": BLUEJAY_WS_CLIENT,
      "/_bluejay/ws/server": BLUEJAY_WS_SERVER,
      "/*": ErrorPage(e),
    };
  }
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
  routes["/"] = routes[options.index ?? "/index.html"];
  if (options.dev) {
    routes["/_bluejay/ws/client"] = BLUEJAY_WS_CLIENT;
    routes["/_bluejay/ws/server"] = BLUEJAY_WS_SERVER;
  }
  routes["/*"] = routes[options.notFound] ?? NotFoundPage(options, files);
  return routes;
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
    routes: await getRoutes(ctx.options),
  });
  ctx.server.publish("bluejay", "BLUEJAY_RELOAD");
};

const startWatcher = (ctx) => {
  let timeout;
  ctx.watcher = watch(ctx.options.meta.dir, { recursive: true }, (_, filename) => {
    clearTimeout(timeout);
    timeout = setTimeout(handleWatch, 100, filename, ctx);
  });
  ctx.watcher.on("close", () => clearTimeout(timeout));
};

const serve = async (options) => {
  const opts = {
    routes: await getRoutes(options),
    port: options.port,
  };
  const ctx = {
    options,
    watcher: null,
  };
  if (options.dev) {
    opts.websocket = {
      open: (ws) => ws.subscribe("bluejay"),
    };
    startWatcher(ctx);
  }
  ctx.server = Bun.serve(opts);
  return ctx;
};

export { build, serve, transform };
