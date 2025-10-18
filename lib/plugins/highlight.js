// Inspired by https://github.com/remarkjs/remark-highlight.js

import hljs from "highlight.js";
import { visit } from "unist-util-visit";

class HljsEmitter {
	nodes = [{ type: "root", children: [] }];

	addText(value) {
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

	openNode(scopes) {
		const child = {
			type: "element",
			tagName: "span",
			properties: { className: scopes.split(".").map((c, i) => `hljs-${c}${"_".repeat(i)}`) },
			children: [],
		};
		const children = this.nodes[this.nodes.length - 1].children;
		children[children.length] = child;
		this.nodes[this.nodes.length] = child;
	}

	__addSublanguage(e) {
		const a = this.nodes[this.nodes.length - 1].children;
		const b = e.nodes[0].children;
		for (let i = 0, j = b.length; i < j; i++) {
			a[a.length] = b[i];
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
	visit(tree, "code", (node, index, parent) => {
		if (node.lang === null) {
			return;
		}
		const children = hljs.highlight(node.value, { language: node.lang })._emitter.nodes[0].children;
		const lineCount = node.value.match(/\r?\n/g)?.length ?? 0;
		const lines = {
			type: "element",
			tagName: "div",
			children: new Array(lineCount + 1),
			properties: { className: "codeblock-lines" },
		};
		for (let i = 0; i <= lineCount; i++) {
			lines.children[i] = {
				type: "element",
				tagName: "div",
				children: [{ type: "text", value: `${i + 1}` }],
			};
		}
		const src = {
			type: "element",
			tagName: "pre",
			children: [{ type: "element", tagName: "code", children }],
			properties: { className: "codeblock-src" },
		};
		const body = {
			type: "element",
			tagName: "div",
			children: [lines, src],
			properties: { className: "codeblock-body" },
		};
		const head = {
			type: "element",
			tagName: "header",
			children: [{ type: "element", tagName: "span", children: [{ type: "text", value: node.lang }] }],
			properties: { className: "codeblock-head" },
		};
		parent.children[index] = {
			data: {
				hChildren: [head, body],
				hProperties: { className: `codeblock lang-${node.lang}`, "data-language": node.lang },
			},
		};
	});
};
