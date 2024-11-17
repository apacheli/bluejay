// Inspired by https://github.com/remarkjs/remark-highlight.js

import hljs from "highlight.js";
import { visit } from "unist-util-visit";

class HljsEmitter {
    // biome-ignore lint/suspicious/noExplicitAny: womp womp
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
        this.nodes.length--;
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

    __addSublanguage(emitter2: HljsEmitter, className: string) {
        const children = this.nodes[this.nodes.length - 1].children;
        const children2 = emitter2.nodes[0].children;
        if (className !== undefined) {
            children[children.length] = {
                type: "element",
                tagName: "span",
                properties: { className },
                children: children2,
            };
        } else {
            for (let i = 0, j = children2.length; i < j; i++) {
                children[children.length] = children2[i];
            }
        }
    }

    finalize() {}

    toHTML() {
        return "";
    }
}

HljsEmitter.prototype.endScope = HljsEmitter.prototype.closeNode;
HljsEmitter.prototype.startScope = HljsEmitter.prototype.openNode;

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
