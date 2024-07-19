import { build } from "../main.js";

import Page from "./components/Page.jsx";

await build((page, pages) => {
    return (
        <Page title={page.module.title} description={page.module.description}>
            <page.mod.default pages={pages} />
        </Page>
    );
});
