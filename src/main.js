import { join } from "node:path";
import { render } from "@apacheli/jsx";

import extension from "../lib/plugins/extension.js";
import jsx from "../lib/plugins/jsx.js";
import lightningCss from "../lib/plugins/lightning_css.js";
import markdown from "../lib/plugins/markdown.js";

import Page from "./layouts/page.jsx";

export default {
  meta: import.meta,
  dist: join(Bun.cwd, "./dist"),
  port: 1337,
  dev: Bun.env.NODE_ENV === "development",
  map: {
    "/": ["./static", "./pages"],
    "/assets": ["./assets"],
  },
  plugins: [
    lightningCss({ minify: true }),
    jsx,
    markdown(Bun.YAML.parse, Bun.markdown.react),
    extension({
      ".html": /\.(?:md|jsx)$/,
    }),
    (file, files) => {
      console.log(`    \x1b[32m\u2192\x1b[39m http://localhost:\x1b[36m1337\x1b[39m${file.url}`);
      if (file.render !== undefined) {
        file.content = "<!DOCTYPE html>" + render(Page({ file, files }));
      }
    },
  ],
};
