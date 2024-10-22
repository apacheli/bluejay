import { cp, readdir } from "node:fs/promises";
import type { Server } from "bun";

import { BLUEJAY_WS } from "./dev.tsx";

export interface BluejayOptions<T> {
    /** The location of your assets. Relative to `options.dir`. */
    assets: string;
    /** The directory for your project. We recommend you use either `Bun.cwd` or `import.meta.dir`. */
    dir: string;
    /** The location where your files will build to. Relative to `options.dir`. */
    dist: string;
    /** The index page when accessing `Bun.env.BLUEJAY_PATH`. */
    index?: string;
    /** The page to use when a 404 occurs. Defaults to `${options.dir}/404.md` to behave like GitHub Pages. */
    notFound?: string;
    /** The location of your pages. Relative to `options.dir`. */
    pages: string;
    /** A record of paths for redirection. */
    redirects?: Record<string, string>;
    /** A function that handles page rendering. */
    render: (page: BluejayPage<T>, pages: BluejayPage<T>[]) => string;
    /** A function that runs after rendering all your pages. */
    post?: () => Record<string, BluejayResponse>;
}

export interface BluejayPage<T> {
    /** The JavaScript module. */
    mod: T;
    /** The HTML path to the page. */
    path: string;
}

export interface BluejayResponse {
    data: string | Uint8Array;
    type: string;
}

export const importPages = async <T>(options: BluejayOptions<T>) => {
    const pages = `${options.dir}/${options.pages}`;
    const files = await readdir(pages, { recursive: true });
    const promises = [];
    for (let i = 0, j = files.length; i < j; i++) {
        const path = files[i];
        const ext = path.lastIndexOf(".");
        if (ext !== -1) {
            promises.push(import(`${pages}/${path}`).then((mod) => ({ mod, path: `/${path.slice(0, ext + 1)}html` })));
        }
    }
    return Promise.all(promises);
};

export const importAssets = async <T>(options: BluejayOptions<T>, paths: Record<string, BluejayResponse>) => {
    const assets = `${options.dir}/${options.assets}`;
    const files = await readdir(assets, { recursive: true });
    const promises = [];
    for (let i = 0, j = files.length; i < j; i++) {
        const path = files[i];
        const ext = path.lastIndexOf(".");
        if (ext !== -1) {
            const file = Bun.file(`${assets}/${path}`);
            promises.push(
                file.bytes().then((data) => {
                    paths[`${Bun.env.BLUEJAY_PATH}/${path.replace(/\\/g, "/")}`] = { data, type: file.type };
                }),
            );
        }
    }
    return Promise.all(promises);
};

export const serve = async <T>(options: BluejayOptions<T>) => {
    console.time("serve");
    const paths: Record<string, BluejayResponse> = {};
    const [pages] = await Promise.all([importPages(options), importAssets(options, paths)]);
    for (let i = 0, j = pages.length; i < j; i++) {
        const page = pages[i];
        paths[`${Bun.env.BLUEJAY_PATH}${page.path.replace(/\\/g, "/")}`] = {
            data: `<!DOCTYPE html>${options.render(page, pages)}`,
            type: "text/html",
        };
    }
    const files = options.post?.();
    for (const file in files) {
        paths[`${Bun.env.BLUEJAY_PATH}${file}`] = files[file];
    }
    console.timeEnd("serve");

    let str = "\n";
    for (const path in paths) {
        str += `    \x1b[36m${path}\x1b[39m (\x1b[1m${paths[path].data.length}\x1b[22m B)\n`;
    }
    console.log(str);
    const port = Bun.env.BLUEJAY_PORT ?? 1337;
    console.log(`Serving at \x1b[34mhttp://localhost:\x1b[39m\x1b[36m${port}\x1b[39m\x1b[34m${Bun.env.BLUEJAY_PATH}\x1b[39m\n`);
    const server = Bun.serve({
        port,
        fetch: (request, server) => handleRequest(request, server, paths, options),
        websocket: {
            open: (ws) => ws.subscribe("dev"),
            message: () => {},
        },
    });
    server.publish("dev", "reload");
    return server;
};

export const build = async <T>(options: BluejayOptions<T>) => {
    console.time("build");
    const dist = `${options.dir}/${options.dist}`;
    const promises: unknown[] = [cp(`${options.dir}/${options.assets}`, dist, { recursive: true })];
    const pages = await importPages(options);
    for (let i = 0, j = pages.length; i < j; i++) {
        const page = pages[i];
        const rendered = `<!DOCTYPE html>${options.render(page, pages)}`;
        promises.push(Bun.write(`${dist}/${page.path}`, rendered));
    }
    const files = options.post?.();
    for (const file in files) {
        promises.push(Bun.write(`${dist}${file}`, files[file].data));
    }
    await Promise.all(promises);
    console.timeEnd("build");
    console.log(`\nBuilt files to \x1b[1m${dist}\x1b[22m`);
};

export const handleRequest = <T>(request: Request, server: Server, paths: Record<string, BluejayResponse>, options: BluejayOptions<T>) => {
    const pathname = request.url.slice(request.url.indexOf("/", 8));
    let response: BluejayResponse | undefined;
    if (pathname === Bun.env.BLUEJAY_PATH || pathname === `${Bun.env.BLUEJAY_PATH}/`) {
        response = paths[options.index ?? `${Bun.env.BLUEJAY_PATH}/index.html`];
    } else {
        response = paths[pathname] ?? paths[`${pathname}.html`];
    }
    if (response !== undefined) {
        console.log(`    \x1b[32m${request.method} ${pathname}\x1b[39m`);
        return new Response(response.data, {
            headers: { "Content-Type": response.type },
        });
    }
    const redirect = options.redirects?.[pathname];
    if (redirect !== undefined) {
        console.log(`    \x1b[34m${request.method} ${pathname}\x1b[39m`);
        return Response.redirect(redirect);
    }
    if (pathname === BLUEJAY_WS) {
        return server.upgrade(request) ? undefined : new Response("400 Bad Request", { status: 400 });
    }
    console.log(`    \x1b[31m${request.method} ${pathname}\x1b[39m`);
    response = paths[options.notFound ?? `${Bun.env.BLUEJAY_PATH}/404.html`];
    if (response !== undefined) {
        return new Response(response.data, {
            headers: { "Content-Type": response.type },
            status: 404,
        });
    }
    return new Response("404 Not Found", { status: 404 });
};

export const start = <T>(options: BluejayOptions<T>) => {
    switch (Bun.env.BLUEJAY_MODE) {
        case "build": {
            return build(options);
        }

        case "serve": {
            return serve(options);
        }

        default: {
            throw new Error("Invalid start mode.");
        }
    }
};
