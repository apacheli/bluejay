# Eggbeater

Eggbeater is a simple renderer for static MDX pages.

## Example

```js
import { build } from "eggbeater";

await build((page) => {
    return page.module.default();
});
```

## License

[License](LICENSE.txt)
