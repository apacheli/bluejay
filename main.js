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

const importPages = async () => {
    const pages = [];
    for (const dirent of await readdir("pages", readdirOptions)) {
        if (dirent.isFile()) {
            const path = `${dirent.parentPath}/${dirent.name}`;
            pages.push({
                mod: await import(`${Bun.cwd}${path}`),
                path: `${path.slice(5, -3)}html`,
            });
        }
    }
    return pages;
};

export const build = async (wrap) => {
    console.time("build");
    await cp("assets", "dist/assets", readdirOptions);
    const pages = await importPages();
    for (const page of pages) {
        await Bun.write(
            `dist${page.path}`,
            `<!DOCTYPE html>${renderToStaticMarkup(wrap(page, pages))}`,
        );
    }
    console.timeEnd("build");
};

export const serve = async (wrap) => {
    console.time("serve");
    const paths = new Map();
    console.log("\x1b[1m:: Assets ::\x1b[22m\n");
    for (const dirent of await readdir("assets", readdirOptions)) {
        if (dirent.isFile()) {
            const path = `${dirent.parentPath}/${dirent.name}`.replace(
                pathRegExp,
                "/",
            );
            const asset = Bun.file(path);
            console.log(
                `    \x1b[36m/${path}\x1b[39m (\x1b[1m${asset.size}\x1b[22m B)`,
            );
            paths.set(`/${path}`, {
                body: await asset.bytes(),
                type: asset.type,
            });
        }
    }

    console.log("\n\x1b[1m:: Pages ::\x1b[22m\n");
    const pages = await importPages();
    for (const page of pages) {
        const path = page.path.replace(pathRegExp, "/");
        console.log(`    \x1b[36m${path}\x1b[39m`);
        paths.set(path, {
            body: `<!DOCTYPE html>${renderToStaticMarkup(wrap(page, pages))}`,
            type: "text/html",
        });
    }

    console.log();
    console.timeEnd("serve");
    console.log("\nServing at \x1b[1mhttp://localhost:6009/\x1b[22m\n");
    return Bun.serve({
        port: 6009,
        fetch: (request) => handleRequest(request, paths),
    });
};

const handleRequest = (request, paths) => {
    const url = new URL(request.url);
    let response;
    if (url.pathname === "/") {
        response = paths.get("/index.html");
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
    const notFound = paths.get("/404.html");
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
