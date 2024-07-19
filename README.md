# bluejay

Create a book with MDX, JSX components, and Bun

## Example

```js
import { build } from "bluejay";

await build((page) => {
    return <page.module.default />;
});
```

## License

[License](LICENSE.txt)
