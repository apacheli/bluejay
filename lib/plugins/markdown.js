export default (yaml, md) => {
  return {
    filter: (file) => /\.(?:md|markdown)$/i.test(file.path),
    use: async (file) => {
      const text = await Bun.file(file.path).text();
      if (text.startsWith("---")) {
        const end = text.indexOf("\n---", 3);
        if (end > -1) {
          file.meta = yaml(text.substring(3, end));
          file.render = () => md(text.substring(end + 4));
          return;
        }
      }
      file.meta = null;
      file.render = () => md(text);
    },
  };
};
