import { cp, readdir } from "node:fs/promises";
import mdx from "@mdx-js/esbuild";
import { renderToStaticMarkup } from "preact-render-to-string";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

import Page from "../components/Page.jsx";

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
                mod: await import(`../${path}`),
                path: `${path.slice(5, -3)}html`,
            });
        }
    }
    return pages;
};

const build = async () => {
    console.time("build");
    await cp("assets", "dist/assets", readdirOptions);
    const pages = await importPages();
    for (const page of pages) {
        await Bun.write(
            `dist${page.path}`,
            renderToStaticMarkup(
                <Page {...page.mod}>
                    <page.mod.default pages={pages} />
                </Page>,
            ),
        );
    }
    console.timeEnd("build");
};

const buildPaths = async () => {
    console.time("serve");

    const paths = new Map();

    console.log("\x1b[1m:: Assets ::\x1b[22m\n");
    for (const dirent of await readdir("assets", readdirOptions)) {
        if (dirent.isFile()) {
            const path = `${dirent.parentPath}/${dirent.name}`;
            const asset = Bun.file(path);
            console.log(`    \x1b[36m/${path}\x1b[39m (\x1b[1m${asset.size}\x1b[22m B)`);
            paths.set(`/${path}`, {
                body: await asset.bytes(),
                type: asset.type,
            });
        }
    }

    console.log("\n\x1b[1m:: Pages ::\x1b[22m\n");
    const pages = await importPages();
    for (const page of pages) {
        const rendered = renderToStaticMarkup(
            <Page {...page.mod}>
                <page.mod.default pages={pages} />
            </Page>,
        );
        const path = page.path.replace(pathRegExp, "/");
        console.log(`    \x1b[36m${path}\x1b[39m`);
        paths.set(path, {
            body: `<!DOCTYPE html>${rendered}`,
            type: "text/html",
        });
    }

    console.log();
    console.timeEnd("serve");

    return paths;
};

const serve = (paths) => {
    console.log("\nServing at \x1b[1mhttp://localhost:6009/\x1b[22m\n");
    return Bun.serve({
        port: 6009,
        fetch: (request) => {
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
        },
    });
};

const command = Bun.argv[2] ?? "serve";

switch (command) {
    case "build": {
        await build();
        break;
    }

    case "serve": {
        serve(await buildPaths());
        break;
    }

    default: {
        console.log(`\x1b[31merror\x1b[39m: unknown command: \x1b[1m${command}\x1b[22m\n\nCommands:\n`);
        console.log("    \x1b[36mbuild\x1b[39m\n    Build distribution files.\n");
        console.log("    \x1b[36mserve\x1b[39m (default)\n    Serve files locally. Development only.\n");
    }
}
