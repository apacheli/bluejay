import { transform } from "lightningcss";

const lightningCss = (options) => {
  return async (file) => {
    const result = transform({
      ...options,
      code: await Bun.file(file.path).bytes(),
    });
    file.content = result.code;
  };
};

export default lightningCss;
