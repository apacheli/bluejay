import { join } from "node:path";
import { render } from "@apacheli/jsx";
import Page from "./layouts/page.js";
import { extension, jsx, markdown, url } from "../lib/plugins/bluejay.js";
import lightningCss from "../lib/plugins/lightningcss.js";

const isDevelopment = Bun.env.NODE_ENV === "development";
const port = 1337;

export default {
  cmd: Bun.env.BLUEJAY_COMMAND,
  file: import.meta.filename,
  dev: isDevelopment,
  port,
  dist: join(Bun.cwd, "./dist"),
  src: import.meta.dir,
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
    url(isDevelopment ? `http://localhost:${port}` : "https://apache.li"),
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
        markdown(Bun.YAML.parse, Bun.markdown.react),
        (file, files) => {
          file.render = () => <Page file={file} files={files} />;
        },
      ],
    },
    {
      filter: /\.[jt]sx$/i,
      use: [
        extension(".html", false),
        jsx(),
        (file, files) => {
          file.meta = file.module.meta ?? {};
          file.render = () => <Page file={file} files={files} />;
        },
      ],
    },
    (file) => {
      if (file.render !== undefined) {
        console.log(file);
        file.content = "<!DOCTYPE html>" + render(file.render());
      }
    },
    (file) => {
      console.log(`\x1b[31m\u2192\x1b[39m \x1b[36m${file.url}\x1b[39m`);
    },
  ],
};
