const isWindows = process.platform === "win32";

const url = (u) => {
  return (file) => {
    file.url = u +
      encodeURI(isWindows ? file.dist.split("\\").join("/") : file.dist);
  };
};

const extension = (e, url = true) => {
  return (file) => {
    file.dist = _setExtension(file.dist, e);
    if (file.url !== undefined) {
      file.url = _setExtension(file.url, url ? e : "");
    }
  };
};

const _setExtension = (name, ext) => {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.substring(0, i) + ext : name + ext;
};

const props = (values) => {
  return (file) => {
    for (const key in values) {
      file[key] = values[key];
    }
  };
};

const markdown = (yaml, md) => {
  return async (file) => {
    const text = await Bun.file(file.path).text();
    if (text.startsWith("---")) {
      const end = text.indexOf("\n---", 3);
      if (end > -1) {
        file.meta = yaml(text.substring(3, end));
        file.content = md(text.substring(end + 4));
        return;
      }
    }
    file.meta = {};
    file.content = md(text);
  };
};

export { extension, markdown, props, url };
