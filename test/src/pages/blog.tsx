import type { BluejayPage } from "bluejay";

import Article from "@components/Article";
import type { PageProps } from "@components/Page";

export const title = "Blog";
export const description = "Build static pages with MDX, JSX/TSX components, and Bun.";

export default ({ pages }: { pages: BluejayPage<PageProps>[] }) => (
    <>
        <h1>Blog</h1>
        {pages
            .filter((page) => !page.mod.hidden && page.mod.type === "blog")
            .sort((a, b) => b.mod.date.localeCompare(a.mod.date))
            .map((page) => (
                <Article {...page.mod} url={`${Bun.env.BLUEJAY_PATH}${page.path.slice(0, -5)}`} />
            ))}
    </>
);
