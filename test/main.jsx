import { start } from "../src/main.js";

import Page from "./components/Page.jsx";

await start({
    dir: import.meta.dir,
    mode: Bun.env.START_MODE,
    path: "/bluejay",
    page: (page, pages) => {
        return (
            <Page title={page.module.title} description={page.module.description}>
                <page.module.default pages={pages} />
            </Page>
        );
    },
});
