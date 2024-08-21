import Page from "@components/Page";
import { start } from "bluejay";

start<any>({
  assets: "src/assets",
  dir: import.meta.dir,
  dist: "dist",
  mode: Bun.env.BUILD_MODE,
  pages: "src/pages",
  path: "/bluejay",
  render: (page, pages) => {
    return (
      <Page {...page.mod}>
        <page.mod.default pages={pages} />
      </Page>
    );
  },
});
