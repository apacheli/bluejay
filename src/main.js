import { join } from "node:path";
import { render } from "@apacheli/jsx";

import extension from "../lib/plugins/extension.js";
import jsx from "../lib/plugins/jsx.js";
import lightningCss from "../lib/plugins/lightning_css.js";
import markdown from "../lib/plugins/markdown.js";

import Page from "./layouts/page.jsx";

const dist = join(Bun.cwd, "./dist");
const dev = Bun.env.NODE_ENV === "development";
const mode = Bun.env.BLUEJAY_MODE;
const port = dev ? 1337 : 80;

export default {
  dev,
  dist,
  meta: import.meta,
  mode,
  port,
  map: {
    "/": [
      "./static",
      "./pages",
    ],
    "/assets": [
      "./assets",
    ],
  },
  plugins: [
    lightningCss({
      minify: true,
    }),
    jsx(),
    markdown(Bun.YAML.parse, Bun.markdown.react),
    extension({
      ".html": /\.(?:md|jsx)$/,
    }),
    ({ files }) => {
      files.sort((a, b) => a.url.localeCompare(b.url));
      const destination = mode === "build" ? dist : `http://localhost:${port}`;
      for (const file of files) {
        console.log(`    \x1b[32m\u2192\x1b[39m \x1b[90m${destination}\x1b[36m${file.url}`);
        if (file.render !== undefined) {
          file.content = "<!DOCTYPE html>" + render(<Page file={file} files={files} />);
        }
      }
    },
  ],
};
