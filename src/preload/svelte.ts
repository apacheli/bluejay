import { compile } from "svelte/compiler";

import "./_open.ts";

Bun.plugin({
    name: "svelte",
    setup: (build) => {
        build.onLoad({ filter: /\.svelte$/i }, async ({ path }) => {
            const data = await Bun.file(path).text();
            const hash = Bun.hash(data);
            const filePath = `${Bun.cwd}.bluejay/svelte/${hash}.js`;
            const cache = Bun.file(filePath);
            try {
                return {
                    contents: await cache.text(),
                    loader: "js",
                };
            } catch {
                const { css, js } = compile(data, {
                    generate: "ssr",
                    name: "SvelteComponent",
                    preserveWhitespace: false,
                });
                const contents = `${js.code}\n\nexport const css = ${JSON.stringify(css.code)}`;
                /* await */ Bun.write(filePath, contents);
                return {
                    contents,
                    loader: "js",
                };
            }
        });
    },
});
