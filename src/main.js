import { join } from "node:path";
import { render } from "@apacheli/jsx";
import Page from "./layouts/page.jsx";
import { extension, markdown, props, url } from "../lib/plugins/bluejay.js";
import lightningCss from "../lib/plugins/lightning_css.js";

const dev = Bun.env.NODE_ENV === "development";
const port = dev ? 1337 : 80;

export default {
  file: import.meta.filename,
  dist: join(Bun.cwd, "./dist"),
  src: import.meta.dir,
  cmd: Bun.env.BLUEJAY_COMMAND,
  dev,
  port,
  map: {
    "/": ["./static", "./pages"],
    "/assets": ["./assets"],
  },
  plugins: [
    url(dev ? `http://localhost:${port}` : "https://apache.li"),
    {
      filter: /\.css$/i,
      use: [
        lightningCss({ minify: true }),
      ],
    },
    {
      filter: /\.(?:md|markdown)$/i,
      use: [
        extension(".html", false),
        props({ render: true }),
        markdown(Bun.YAML.parse, Bun.markdown.react),
      ],
    },
    {
      filter: /\.[jt]sx$/i,
      use: [
        extension(".html", false),
        props({ render: true }),
        async (file) => {
          file.module = await import(file.path);
          file.meta = file.module.meta ?? {};
        },
      ],
    },
    (file, files) => {
      console.log(`  \x1b[31m\u2192\x1b[39m \x1b[36m${file.url}\x1b[39m`);
      if (file.render === true) {
        file.content = "<!DOCTYPE html>" + render(Page({ file, files }));
      }
    },
  ],
};
