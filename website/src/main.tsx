import { start } from "bluejay";

import Page, { type PageProps } from "@components/Page";
import { renderToStaticMarkup } from "preact-render-to-string";

await start<PageProps>({
    assets: "assets",
    dir: import.meta.dir,
    dist: "../dist",
    pages: "pages",
    render: (page, pages) => {
        const html = renderToStaticMarkup(
            <Page {...page.mod}>
                <page.mod.default pages={pages} />
            </Page>,
        );
        return `<DOCTYPE html>${html}`;
    },
});
