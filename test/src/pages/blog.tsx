import type { BluejayPage } from "bluejay";

import Article from "@components/Article";
import type { PageProps } from "@components/Page";

export const title = "Blog";
export const description = "Keep up with the latest updates regarding Bluejay development.";

export default ({ pages }: { pages: BluejayPage<PageProps>[] }) => (
    <>
        <h1>Blog</h1>
        {pages
            .filter((page) => page.mod.type === "blog")
            .sort((a, b) => b.mod.date.localeCompare(a.mod.date))
            .map((page) => (
                <Article {...page.mod} url={`/bluejay${page.path.slice(0, -5)}`} />
            ))}
    </>
);
