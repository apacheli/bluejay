import { join } from "node:path";
import { render } from "@apacheli/jsx";
import PageLayout from "./layouts/page_layout.js";
import {
  jsxPlugin,
  lightningCssPlugin,
  markdownPlugin,
  setExtensionPlugin,
  setUrlPlugin,
} from "../lib/plugins.js";

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
    setUrlPlugin(
      isDevelopment ? `http://localhost:${port}` : "https://apache.li",
    ),
    {
      filter: /\.css$/i,
      use: [
        lightningCssPlugin({ minify: true }),
      ],
    },
    {
      filter: /\.(?:md|markdown)$/i,
      use: [
        setExtensionPlugin(".html", false),
        markdownPlugin(Bun.YAML.parse, Bun.markdown.react),
      ],
    },
    {
      filter: /\.[jt]sx$/i,
      use: [
        setExtensionPlugin(".html", false),
        jsxPlugin(),
        async (file, files) => {
          file.meta = file.module.meta ?? {};
          file.content = render(<PageLayout file={file} files={files} />);
        },
      ],
    },
    (file) => {
      console.log(file.url);
    },
  ],
};
