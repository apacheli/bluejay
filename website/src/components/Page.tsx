import { BLUEJAY_WS_SCRIPT, type BluejayPage } from "bluejay";
import type { JSX } from "preact";

import Footer from "@components/Footer";
import Header from "@components/Header";

import AngleUp from "@icons/AngleUp.svg";

export interface PageProps {
    title: string;
    description: string;
    date: string;
    type: string;
    children: JSX.Element | JSX.Element[];
    hidden?: boolean;
    default: (opts: { pages: BluejayPage<PageProps>[] }) => JSX.Element;
}

export default ({ title, description, children }: PageProps) => (
    <html lang="en">
        <head>
            <title>{`Bluejay - ${title}`}</title>
            <link rel="icon" href={`${Bun.env.BLUEJAY_PATH}/icon.png`} />
            <link rel="stylesheet" href={`${Bun.env.BLUEJAY_PATH}/index.css`} />
            <meta charset="utf8" />
            <meta name="description" content={description} />
            <meta name="theme-color" content="#41c2f5" />
            <meta name="viewport" content="width=device-width" />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${Bun.env.BLUEJAY_URL}/logo.png`} />
            <meta property="og:title" content={title} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={Bun.env.BLUEJAY_URL} />
        </head>
        <body>
            <Header />
            <main class="content">{children}</main>
            <Footer />
            <a href="#" class="scroll-to-top" aria-label="scroll to top">
                <AngleUp class="icon-hover" />
            </a>
            {Bun.env.BLUEJAY_MODE === "serve" ? <script src={BLUEJAY_WS_SCRIPT} /> : undefined}
        </body>
    </html>
);
