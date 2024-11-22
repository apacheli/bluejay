import * as mdsvex from "mdsvex";
import { compile } from "svelte/compiler";

const svelteOptions = {
    generate: "server",
    name: "SvelteComponent",
};

Bun.plugin({
    name: "svelte",
    setup: (build) => {
        build.onLoad({ filter: /\.(svelte|svx)$/i }, async ({ path }) => {
            const data = await Bun.file(path).text();
            const hash = Bun.hash(data);
            const filePath = `${Bun.cwd}.bluejay/svelte/${hash}.js`;
            try {
                return {
                    contents: await Bun.file(filePath).text(),
                    loader: "js",
                };
            } catch {
                const { css, js } = compile((await mdsvex.compile(data)).code, svelteOptions);
                const contents = `${js.code}\n\nexport const css = ${JSON.stringify(css?.code)};\n`;
                /* await */ Bun.write(filePath, contents);
                return {
                    contents,
                    loader: "js",
                };
            }
        });
    },
});
