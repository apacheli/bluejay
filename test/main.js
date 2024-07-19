import { serve } from "../main.js";

import Page from "./components/Page.jsx";

await serve((page, pages) => {
    return (
        <Page title={page.module.title} description={page.module.description}>
            <page.module.default pages={pages} />
        </Page>
    );
});
