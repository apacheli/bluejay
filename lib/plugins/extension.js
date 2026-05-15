const setExtension = (name, ext) => {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.substring(0, i) + ext : name + ext;
};

export default (opts) => {
  return (file) => {
    for (const extension in opts) {
      if (opts[extension].test(file.path)) {
        file.url = setExtension(file.url, extension);
      }
    }
  };
};
