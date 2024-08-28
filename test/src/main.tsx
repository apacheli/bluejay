import { start } from "bluejay";

import Page, { type PageProps } from "@components/Page";

await start<PageProps>({
    assets: "assets",
    dir: import.meta.dir,
    dist: "../dist",
    mode: Bun.env.BUILD_MODE as "build" | "serve",
    pages: "pages",
    path: "/bluejay",
    render: (page, pages) => {
        return (
            <Page {...page.mod}>
                <page.mod.default pages={pages} />
            </Page>
        );
    },
});
