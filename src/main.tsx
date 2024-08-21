import { cp, readdir } from "node:fs/promises";
import type { JSX } from "preact";
import { renderToStaticMarkup } from "preact-render-to-string";

export interface BluejayOptions<T> {
  assets: string;
  dir: string;
  dist: string;
  mode?: string;
  pages: string;
  path: string;
  port?: number;
  redirects?: Record<string, string>;
  render: (page: BluejayPage<T>, pages: BluejayPage<T>[]) => JSX.Element;
}

export interface BluejayPage<T> {
  mod: T;
  path: string;
}

export interface BluejayResponse {
  data: string | Uint8Array;
  type: string;
}

export const importPages = async <T,>(opts: BluejayOptions<T>) => {
  // @ts-ignore: `options.recursive` is supported.
  const files = await readdir(`${opts.dir}/${opts.pages}`, { recursive: true });
  const promises = [];
  for (let i = 0, j = files.length; i < j; i++) {
    const path = files[i];
    const ext = path.lastIndexOf(".");
    if (ext !== -1) {
      const promise = import(`${opts.dir}/${opts.pages}/${path}`).then(
        (mod) => ({
          mod,
          path: `/${path.slice(0, ext + 1)}html`,
        }),
      );
      promises.push(promise);
    }
  }
  return Promise.all(promises);
};

export const importAssets = async <T,>(
  opts: BluejayOptions<T>,
  paths: Map<string, BluejayResponse>,
) => {
  const files = await readdir(`${opts.dir}/${opts.assets}`, {
    // @ts-ignore: `options.recursive` is supported.
    recursive: true,
  });
  const promises = [];
  for (let i = 0, j = files.length; i < j; i++) {
    const path = files[i];
    const ext = path.lastIndexOf(".");
    if (ext !== -1) {
      const file = Bun.file(`${opts.dir}/${opts.assets}/${path}`);
      // @ts-ignore: `Blob.bytes()` is not typed.
      const promise = file.bytes().then((data: Uint8Array) =>
        paths.set(`${opts.path}/${path.replace(/\\/g, "/")}`, {
          data,
          type: file.type,
        }),
      );
      promises.push(promise);
    }
  }
  return Promise.all(promises);
};

export const serve = async <T,>(opts: BluejayOptions<T>) => {
  console.time("serve");
  const paths = new Map<string, BluejayResponse>();
  const [pages] = await Promise.all([
    importPages(opts),
    importAssets(opts, paths),
  ]);
  for (let i = 0, j = pages.length; i < j; i++) {
    const page = pages[i];
    paths.set(`${opts.path}${page.path.replace(/\\/g, "/")}`, {
      data: `<!DOCTYPE html>${renderToStaticMarkup(opts.render(page, pages))}`,
      type: "text/html",
    });
  }
  console.timeEnd("serve");

  let str = "\n";
  for (const path of paths.keys()) {
    str += `    \x1b[36m${path}\x1b[39m\n`;
  }
  console.log(str);
  const port = opts?.port ?? 1337;
  console.log(
    `Serving at \x1b[1mhttp://localhost:${port}${opts.path ?? "/"}\x1b[22m\n`,
  );
  return Bun.serve({
    port,
    fetch: (request) => handleRequest(request, paths, opts),
  });
};

export const build = async <T,>(opts: BluejayOptions<T>) => {
  console.time("build");
  const promises: unknown[] = [
    cp(`${opts.dir}/${opts.assets}`, `${opts.dir}/${opts.dist}`, {
      recursive: true,
    }),
  ];
  const pages = await importPages(opts);
  for (let i = 0, j = pages.length; i < j; i++) {
    const page = pages[i];
    const rendered = `<!DOCTYPE html>${renderToStaticMarkup(opts.render(page, pages))}`;
    promises.push(Bun.write(`${opts.dir}/${opts.dist}/${page.path}`, rendered));
  }
  await Promise.all(promises);
  console.timeEnd("build");
};

export const handleRequest = <T,>(
  request: Request,
  paths: Map<string, BluejayResponse>,
  opts: BluejayOptions<T>,
) => {
  const url = new URL(request.url);
  let response: BluejayResponse | undefined;
  if (url.pathname === opts.path || url.pathname === `${opts.path}/`) {
    response = paths.get(`${opts.path}/index.html`);
  } else {
    response = paths.get(url.pathname) ?? paths.get(`${url.pathname}.html`);
  }
  if (response !== undefined) {
    console.log(`    \x1b[32m${request.method} ${url.pathname}\x1b[39m`);
    return new Response(response.data, {
      headers: {
        "Content-Type": response.type,
      },
    });
  }
  const redirect = opts.redirects?.[url.pathname];
  if (redirect !== undefined) {
    console.log(`    \x1b[34m${request.method} ${url.pathname}\x1b[39m`);
    return Response.redirect(redirect);
  }
  console.log(`    \x1b[31m${request.method} ${url.pathname}\x1b[39m`);
  response = paths.get(`${opts.path}/404.html`);
  if (response !== undefined) {
    return new Response(response.data, {
      headers: {
        "Content-Type": response.type,
      },
      status: 404,
    });
  }
  return new Response(`404 Not Found: ${request.method} ${url.pathname}`, {
    status: 404,
  });
};

export const start = <T,>(opts: BluejayOptions<T>) => {
  switch (opts.mode ?? "build") {
    case "build": {
      return build(opts);
    }

    case "serve": {
      return serve(opts);
    }
  }
};
