// Inspired by https://github.com/remarkjs/remark-highlight.js

import hljs from "highlight.js";
import { visit } from "unist-util-visit";

class HljsEmitter {
    nodes: any[] = [{ type: "root", children: [] }];

    constructor(public options: unknown) {}

    addText(value: string) {
        if (value === "") {
            return;
        }
        const children = this.nodes[this.nodes.length - 1].children;
        const last = children[children.length - 1];
        if (last?.type === "text") {
            last.value += value;
        } else {
            children[children.length] = { type: "text", value };
        }
    }

    closeNode() {
        this.nodes.length -= 1;
    }

    openNode(scopes: string) {
        const child = {
            type: "element",
            tagName: "span",
            properties: { className: scopes.split(".").map((c, i) => `hljs-${c}${"_".repeat(i)}`) },
            children: [],
        };
        const children = this.nodes[this.nodes.length - 1].children;
        children[children.length] = this.nodes[this.nodes.length] = child;
    }

    declare endScope: typeof this.closeNode;
    declare startScope: typeof this.openNode;

    declare __addSublanguage: () => void;
    declare finalize: () => void;
    declare toHTML: () => void;
}

const p = HljsEmitter.prototype;

// highlight.js does weird stuff.
p.endScope = p.closeNode;
p.startScope = p.openNode;
p.finalize = p.__addSublanguage = p.toHTML = () => {};

hljs.configure({ __emitter: HljsEmitter });

export default () => (tree) => {
    visit(tree, "code", (node) => {
        if (node.lang === null) {
            return;
        }
        node.data = {
            hChildren: hljs.highlight(node.value, { language: node.lang })._emitter.nodes[0].children,
            hProperties: { className: `language-${node.lang}` },
        };
    });
};
