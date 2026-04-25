import { transform } from "lightningcss";

const setUrlPlugin = (url) => {
  return (file) => {
    file.url = url +
      encodeURI(
        process.platform === "win32"
          ? file.dist.split("\\").join("/")
          : file.dist,
      );
  };
};

const setExtensionPlugin = (ext, inUrl = true) => {
  return (file) => {
    file.dist = _setExtension(file.dist, ext);
    if (file.url !== undefined) {
      file.url = _setExtension(file.url, inUrl ? ext : "");
    }
  };
};

const _setExtension = (name, ext) => {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.substring(0, i) + ext : name + ext;
};

const lightningCssPlugin = (options) => {
  return async (file) => {
    const result = transform({
      ...options,
      code: await Bun.file(file.path).bytes(),
    });
    file.content = result.code;
  };
};

const jsxPlugin = () => {
  return async (file) => {
    file.module = await import(file.path);
  };
};

const markdownPlugin = (yaml, markdown) => {
  return async (file) => {
    const text = await Bun.file(file.path).text();
    if (text.startsWith("---")) {
      const end = text.indexOf("\n---", 3);
      if (end > -1) {
        file.meta = yaml(text.substring(3, end));
        file.element = markdown(text.substring(end + 4));
        return;
      }
    }
    file.meta = {};
    file.element = markdown(text);
  };
};

export {
  jsxPlugin,
  lightningCssPlugin,
  markdownPlugin,
  setExtensionPlugin,
  setUrlPlugin,
};
