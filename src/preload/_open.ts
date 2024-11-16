import open from "open";

if (Bun.env.BLUEJAY_MODE === "serve") {
    /* await */ open(`http://localhost:${Bun.env.BLUEJAY_PORT ?? 1337}${Bun.env.BLUEJAY_PATH}`);
}
