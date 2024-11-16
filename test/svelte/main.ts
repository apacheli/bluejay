import { BLUEJAY_DEV, start } from "bluejay";

import { render } from "svelte/server";

interface Page {
    default: (...args: any) => any,
    css: string;
}

await start<Page>({
    assets: "assets",
    dir: import.meta.dir,
    dist: "../dist",
    pages: "pages",
    render: (page) => {
        const { head, body } = render(page.mod.default, {});
        return `<html lang="en"><head><style>${page.mod.css}</style>${head}</head><body>${body}${BLUEJAY_DEV}</body></html>`;
    },
});
