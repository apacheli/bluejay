const setExtension = (name, ext) => {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.substring(0, i) + ext : name + ext;
};

export default (extensions) => {
  return ({ files }) => {
    for (const file of files) {
      for (const extension in extensions) {
        if (extensions[extension].test(file.path)) {
          file.url = setExtension(file.url, extension);
        }
      }
    }
  };
};
