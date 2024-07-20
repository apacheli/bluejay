import { cp, readdir } from "node:fs/promises";
import mdx from "@mdx-js/esbuild";
import { renderToStaticMarkup } from "preact-render-to-string";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

const pathRegExp = /\\/g;
const readdirOptions = {
    recursive: true,
    withFileTypes: true,
};

Bun.plugin(
    mdx({
        jsxImportSource: "preact",
        remarkPlugins: [remarkEmoji, remarkGfm],
    }),
);

Bun.plugin({
    name: "svg",
    setup: (build) => {
        build.onLoad({ filter: /\.svg$/ }, async (args) => {
            const svg = await Bun.file(args.path).text();
            return {
                contents: `export default()=>${svg}`,
                loader: "js",
            };
        });
    },
});

const importPages = async (options) => {
    const pages = [];
    for (const dirent of await readdir(`${options.dir}/pages`, readdirOptions)) {
        if (dirent.isFile()) {
            const file = `${dirent.parentPath}/${dirent.name}`;
            pages.push({
                module: await import(file),
                path: `${file.slice(options.dir.length + 7, -3)}html`,
            });
        }
    }
    return pages;
};

export const build = async (options) => {
    console.time("build");
    await cp(`${options.dir}/assets`, `${options.dir}/dist/assets`, readdirOptions);
    const pages = await importPages(options);
    for (const page of pages) {
        await Bun.write(`${options.dir}/dist/${page.path}`, `<!DOCTYPE html>${renderToStaticMarkup(options.page(page, pages))}`);
    }
    console.timeEnd("build");
};

export const serve = async (options) => {
    const p = options.path === "/" ? "" : options.path;
    console.time("serve");
    const paths = new Map();
    console.log("\x1b[1m:: Assets ::\x1b[22m\n");
    for (const dirent of await readdir(`${options.dir}/assets`, readdirOptions)) {
        if (dirent.isFile()) {
            const path = `${dirent.parentPath}/${dirent.name}`;
            const asset = Bun.file(path);
            const x = `${p}/${path.slice(options.dir.length + 1)}`.replace(pathRegExp, "/");
            console.log(`    \x1b[36m${x}\x1b[39m (\x1b[1m${asset.size}\x1b[22m B)`);
            paths.set(x, {
                body: await asset.bytes(),
                type: asset.type,
            });
        }
    }

    console.log("\n\x1b[1m:: Pages ::\x1b[22m\n");
    const pages = await importPages(options);
    for (const page of pages) {
        const path = `${p}/${page.path.replace(pathRegExp, "/")}`;
        console.log(`    \x1b[36m${path}\x1b[39m`);
        paths.set(path, {
            body: `<!DOCTYPE html>${renderToStaticMarkup(options.page(page, pages))}`,
            type: "text/html",
        });
    }

    console.log();
    console.timeEnd("serve");
    console.log(`\nServing at \x1b[1mhttp://localhost:6009${options.path}\x1b[22m\n`);
    return Bun.serve({
        port: 6009,
        fetch: (request) => handleRequest(request, paths, options),
    });
};

export const start = (options) => {
    switch (options.mode ?? "build") {
        case "build": {
            return build(options);
        }

        case "serve": {
            return serve(options);
        }

        default: {
            throw new Error(`Invalid mode '${options.mode}'`);
        }
    }
};

const handleRequest = (request, paths, options) => {
    const url = new URL(request.url);
    const p = options.path === "/" ? "" : options.path;
    let response;
    if (url.pathname === options.path) {
        response = paths.get(`${p}/index.html`);
    } else {
        response = paths.get(url.pathname) ?? paths.get(`${url.pathname}.html`);
    }
    if (response !== undefined) {
        console.log(`    \x1b[32m${request.method} ${url.pathname}\x1b[39m`);
        return new Response(response.body, {
            headers: {
                "Content-Type": response.type,
            },
        });
    }
    console.log(`    \x1b[31m${request.method} ${url.pathname}\x1b[39m`);
    const notFound = paths.get(`${p}/404.html`);
    if (notFound !== undefined) {
        return new Response(notFound.body, {
            headers: {
                "Content-Type": notFound.type,
            },
            status: 404,
        });
    }
    return new Response("404 Not Found", {
        status: 404,
    });
};
