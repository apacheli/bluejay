export default ({ title, description, children }) => (
    <>
        <head>
            <title>{title}</title>
            <link rel="icon" href="/bluejay/assets/icon.png" />
            <link rel="stylesheet" href="/bluejay/assets/index.css" />
            <meta charset="utf8" />
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width" />
        </head>
        <body>
            <div class="content">{children}</div>
        </body>
    </>
);
