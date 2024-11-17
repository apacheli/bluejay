import { compile } from "@mdx-js/mdx";
import alertPlugin from "@plugins/mdx/alert";
import highlightPlugin from "@plugins/mdx/highlight";
import slugPlugin from "@plugins/mdx/slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";

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
            try {
                return {
                    contents: await Bun.file(filePath).text(),
                    loader: "js",
                };
            } catch {
                const contents = (await compile({ path, value: data }, mdxOptions)).value;
                /* await */ Bun.write(filePath, contents);
                return {
                    contents,
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
