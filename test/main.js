import { build, serve } from "../src/main.js";

import Page from "./components/Page.jsx";

const action = Bun.argv[2] === "build" ? build : serve;

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
