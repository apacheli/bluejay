export default ({ frontmatter, parse }) => {
  frontmatter ??= {
    "---": Bun.YAML.parse,
  };
  return async ({ files }) => {
    for (const file of files) {
      if (!/\.(?:md|markdown)$/i.test(file.path)) {
        continue;
      }
      const text = await Bun.file(file.path).text();
      for (const delimiter in frontmatter) {
        if (text.startsWith(delimiter)) {
          const end = text.indexOf(`\n${delimiter}`, delimiter.length);
          if (end > -1) {
            file.meta = frontmatter[delimiter](text.substring(delimiter.length, end));
            file.render = () => parse(text.substring(end + delimiter.length + 1));
            break;
          }
        }
      }
      file.meta ??= null;
      file.render ??= () => parse(text);
    }
  };
};
