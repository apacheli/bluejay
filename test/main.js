import { build } from "../main.js";

import Page from "./components/Page.jsx";

await build((page, pages) => {
    return (
        <Page title={page.mod.title} description={page.mod.description}>
            <page.mod.default pages={pages} />
        </Page>
    );
});
