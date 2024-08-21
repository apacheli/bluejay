import type { BluejayPage } from "bluejay";
import type { JSX } from "preact";

import Footer from "@components/Footer";
import Header from "@components/Header";

export interface PageProps {
    title: string;
    description: string;
    date?: string;
    type?: string;
    children: JSX.Element | JSX.Element[];
    default: (opts: { pages: BluejayPage<PageProps>[] }) => JSX.Element;
}

export default ({ title, description, children }: PageProps) => (
    <>
        <head>
            <title>{`Bluejay - ${title}`}</title>
            <link rel="icon" href="/bluejay/icon.png" />
            <link rel="stylesheet" href="/bluejay/index.css" />
            <meta charset="utf8" />
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width" />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="https://apache.li/bluejay/logo.png" />
            <meta property="og:title" content={title} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://apache.li/bluejay" />
        </head>
        <body>
            <Header />
            <main class="content">{children}</main>
            <Footer />
        </body>
    </>
);
