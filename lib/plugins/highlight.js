// Inspired by https://github.com/remarkjs/remark-highlight.js

import hljs from "highlight.js";
import { visit } from "unist-util-visit";

class HljsEmitter {
	nodes = [{ type: "root", children: [] }];
	lines = 0;

	constructor() {
		this.addLineNode();
	}

	addNode(node) {
		const children = this.nodes[this.nodes.length - 1].children;
		children[children.length] = node;
		this.nodes[this.nodes.length] = node;
	}

	addLineNode() {
		this.lines++;
		this.addNode({
			type: "element",
			tagName: "div",
			properties: { className: "code-line", "data-line": `${this.lines}` },
			children: [],
		});
	}

	addText(value) {
		if (value === "") {
			return;
		}

		const lines = value.split(/\r?\n/);
		for (let i = 0, j = lines.length; i < j; i++) {
			const children = this.nodes[this.nodes.length - 1].children;
			const last = children[children.length - 1];

			if (last?.type === "text") {
				last.value += lines[i];
			} else {
				children[children.length] = { type: "text", value: lines[i] };
			}

			if (i < j - 1) {
				children[children.length] = { type: "text", value: "\n" };
				this.endScope();
				this.addLineNode();
			}
		}
	}

	startScope(scopes) {
		this.addNode({
			type: "element",
			tagName: "span",
			properties: { className: scopes.split(".").map((c, i) => `hljs-${c}${"_".repeat(i)}`) },
			children: [],
		});
	}

	endScope() {
		this.nodes.length--;
	}

	__addSublanguage(emitter2) {
		// Do not open a new node on the first one
		const b = emitter2.nodes[0].children;
		this.nodes[this.nodes.length - 1].children.push(...b[0].children);
		for (let i = 1, j = b.length; i < j; i++) {
			this.closeNode();
			this.addLineNode();
			this.nodes[this.nodes.length - 1].children = b[i].children;
		}
	}

	finalize() {}

	toHTML() {
		return "";
	}
}

HljsEmitter.prototype.openNode = HljsEmitter.prototype.startScope;
HljsEmitter.prototype.closeNode = HljsEmitter.prototype.endScope;

hljs.configure({ __emitter: HljsEmitter });

export default () => (tree) => {
	visit(tree, "code", (node, index) => {
		if (node.lang === null) {
			return;
		}
		const children = hljs.highlight(node.value, { language: node.lang })._emitter.nodes[0].children;
		const codeblockHeader = {
			type: "element",
			tagName: "header",
			children: [{ type: "element", tagName: "span", children: [{ type: "text", value: node.lang }] }],
			properties: { className: "codeblock-header" },
		};
		const codeblockSource = {
			type: "element",
			tagName: "pre",
			children: [{ type: "element", tagName: "code", children }],
			properties: { className: "codeblock-source" },
		};
		tree.children[index] = {
			data: {
				hChildren: [codeblockHeader, codeblockSource],
				hProperties: { className: `codeblock language-${node.lang}`, "data-language": node.lang },
			},
		};
	});
};
