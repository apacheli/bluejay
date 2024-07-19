import { build, serve } from "../main.js";

import Page from "./components/Page.jsx";

const action = Bun.argv[2] === "serve" ? serve : build;

await action({
    dir: import.meta.dir,
    path: "/bluejay",
    page: (page, pages) => {
        return (
            <Page title={page.module.title} description={page.module.description}>
                <page.module.default pages={pages} />
            </Page>
        );
    },
});
