# bluejay

Create a book with MDX, JSX components, and Bun

## Example

```js
import { build } from "bluejay";

await build({
    dir: import.meta.dir,
    path: "/",
    page: (page) => {
        return <page.module.default />;
    },
});
```

## License

[License](LICENSE.txt)
