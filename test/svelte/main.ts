import { BLUEJAY_DEV_HTML, start } from "bluejay";

let css = "";

await start({
    assets: "assets",
    dir: import.meta.dir,
    dist: "../dist",
    pages: "pages",
    render: (page) => {
        css += page.mod.css;
        return `<html lang="en"><head><link rel="stylesheet" href="/svelte/index.css" /></head><body>${page.mod.default()}${BLUEJAY_DEV_HTML}</body></html>`;
    },
    post: () => ({ "/index.css": { data: css, type: "text/css" } }),
});
