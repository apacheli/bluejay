declare module "*.md" {
    import type { JSX } from "preact";
    const content: (props: JSX.IntrinsicAttributes) => JSX.Element;
    export default content;
}

declare module "*.mdx" {
    import type { JSX } from "preact";
    const content: (props: JSX.IntrinsicAttributes) => JSX.Element;
    export default content;
}

declare module "*.svg" {
    import type { JSX } from "preact";
    const content: (props: JSX.IntrinsicAttributes) => JSX.Element;
    export default content;
}
