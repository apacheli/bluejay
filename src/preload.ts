import { compile as mdxCompile } from "@mdx-js/mdx";
import alertPlugin from "@plugins/alert";
import highlightPlugin from "@plugins/highlight";
import slugPlugin from "@plugins/slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";

import "preact";
import "preact-render-to-string";

const mdxOptions = {
    remarkPlugins: [remarkGemoji, remarkGfm, alertPlugin, highlightPlugin, slugPlugin],
    jsxImportSource: "preact",
};

Bun.plugin({
    name: "mdx",
    setup: (build) => {
        build.onLoad({ filter: /\.(?:mdx?|markdown)$/i }, async ({ path }) => {
            const data = await Bun.file(path).text();
            const hash = Bun.hash(data);
            const filePath = `${Bun.cwd}.bluejay/mdx/${hash}.js`;
            const cache = Bun.file(filePath);
            try {
                return {
                    contents: await cache.text(),
                    loader: "js",
                };
            } catch {
                const compiled = await mdxCompile({ path, value: data }, mdxOptions);
                /* await */ Bun.write(filePath, compiled.value);
                return {
                    contents: compiled.value,
                    loader: "js",
                };
            }
        });
    },
});

Bun.plugin({
    name: "svg",
    setup: (build) => {
        build.onLoad({ filter: /\.svg$/i }, async (args) => {
            const svg = await Bun.file(args.path).text();
            return {
                contents: `export default p=>{const s=${svg};for(const k in p)s.props[k]=p[k];return s}`,
                loader: "js",
            };
        });
    },
});
