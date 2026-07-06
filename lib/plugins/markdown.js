export default (yaml, markdown) => {
  return async ({ files }) => {
    for (const file of files) {
      if (/\.(?:md|markdown)$/i.test(file.path)) {
        const text = await Bun.file(file.path).text();
        if (text.startsWith("---")) {
          const end = text.indexOf("\n---", 3);
          if (end > -1) {
            file.meta = yaml(text.substring(3, end));
            file.render = () => markdown(text.substring(end + 4));
            return;
          }
        }
        file.meta = null;
        file.render = () => markdown(text);
      }
    }
  };
};
