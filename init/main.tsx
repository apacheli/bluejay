import { start } from "bluejay";

await start({
    dir: import.meta.dir,
    mode: Bun.env.START_MODE,
    page: (page) => {
        return (
            <html lang="en">
                <head>
                    <title>bluejay example</title>
                    <link rel="stylesheet" href="/assets/index.css" />
                    <meta charset="utf8" />
                    <meta name="viewport" content="width=device-width" />
                </head>
                <body>
                    <div class="content">
                        <page.module.default />
                    </div>
                </body>
            </html>
        );
    },
});
