import { cp, readdir } from "node:fs/promises";
import type { JSX } from "preact";
import { renderToStaticMarkup } from "preact-render-to-string";

export interface BluejayOptions<T> {
    /** The location of your assets. Relative to `BluejayOptions.dir`. */
    assets: string;
    /** The directory for your project. We recommend you use either `Bun.cwd` or `import.meta.dir`. */
    dir: string;
    /** The location where your files will build to. Relative to `BluejayOptions.dir`. */
    dist: string;
    /** The execution mode. */
    mode?: "build" | "serve";
    /** The location of your pages. Relative to `BluejayOptions.dir`. */
    pages: string;
    /** The path to use when running locally. Use an empty string if the path is `/`. */
    path: string;
    /** Local port. */
    port?: number;
    /** A record of paths for redirection. */
    redirects?: Record<string, string>;
    /** A function that handles page rendering. */
    render: (page: BluejayPage<T>, pages: BluejayPage<T>[]) => JSX.Element;
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

export const importPages = async <T,>(options: BluejayOptions<T>) => {
    const files = await readdir(`${options.dir}/${options.pages}`, { recursive: true });
    const promises = [];
    for (let i = 0, j = files.length; i < j; i++) {
        const path = files[i];
        const ext = path.lastIndexOf(".");
        if (ext !== -1) {
            const promise = import(`${options.dir}/${options.pages}/${path}`).then((mod) => ({
                mod,
                path: `/${path.slice(0, ext + 1)}html`,
            }));
            promises.push(promise);
        }
    }
    return Promise.all(promises);
};

export const importAssets = async <T,>(options: BluejayOptions<T>, paths: Map<string, BluejayResponse>) => {
    const files = await readdir(`${options.dir}/${options.assets}`, { recursive: true });
    const promises = [];
    for (let i = 0, j = files.length; i < j; i++) {
        const path = files[i];
        const ext = path.lastIndexOf(".");
        if (ext !== -1) {
            const file = Bun.file(`${options.dir}/${options.assets}/${path}`);
            // @ts-ignore: `Blob.bytes()` is not typed.
            const promise = file.bytes().then((data: Uint8Array) =>
                paths.set(`${options.path}/${path.replace(/\\/g, "/")}`, {
                    data,
                    type: file.type,
                }),
            );
            promises.push(promise);
        }
    }
    return Promise.all(promises);
};

export const serve = async <T,>(options: BluejayOptions<T>) => {
    console.time("serve");
    const paths = new Map<string, BluejayResponse>();
    const [pages] = await Promise.all([importPages(options), importAssets(options, paths)]);
    for (let i = 0, j = pages.length; i < j; i++) {
        const page = pages[i];
        paths.set(`${options.path}${page.path.replace(/\\/g, "/")}`, {
            data: `<!DOCTYPE html>${renderToStaticMarkup(options.render(page, pages))}`,
            type: "text/html",
        });
    }
    console.timeEnd("serve");

    let str = "\n";
    for (const path of paths.keys()) {
        str += `    \x1b[36m${path}\x1b[39m\n`;
    }
    console.log(str);
    const port = options?.port ?? 1337;
    console.log(`Serving at \x1b[1mhttp://localhost:${port}${options.path ?? "/"}\x1b[22m\n`);
    return Bun.serve({
        port,
        fetch: (request) => handleRequest(request, paths, options),
    });
};

export const build = async <T,>(options: BluejayOptions<T>) => {
    console.time("build");
    const promises: unknown[] = [
        cp(`${options.dir}/${options.assets}`, `${options.dir}/${options.dist}`, {
            recursive: true,
        }),
    ];
    const pages = await importPages(options);
    for (let i = 0, j = pages.length; i < j; i++) {
        const page = pages[i];
        const rendered = `<!DOCTYPE html>${renderToStaticMarkup(options.render(page, pages))}`;
        promises.push(Bun.write(`${options.dir}/${options.dist}/${page.path}`, rendered));
    }
    await Promise.all(promises);
    console.timeEnd("build");
};

export const handleRequest = <T,>(request: Request, paths: Map<string, BluejayResponse>, options: BluejayOptions<T>) => {
    const url = new URL(request.url);
    let response: BluejayResponse | undefined;
    if (url.pathname === options.path || url.pathname === `${options.path}/`) {
        response = paths.get(`${options.path}/index.html`);
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
    const redirect = options.redirects?.[url.pathname];
    if (redirect !== undefined) {
        console.log(`    \x1b[34m${request.method} ${url.pathname}\x1b[39m`);
        return Response.redirect(redirect);
    }
    console.log(`    \x1b[31m${request.method} ${url.pathname}\x1b[39m`);
    response = paths.get(`${options.path}/404.html`);
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

export const start = <T,>(options: BluejayOptions<T>) => {
    switch (options.mode ?? "build") {
        case "build": {
            return build(options);
        }

        case "serve": {
            return serve(options);
        }
    }
};
