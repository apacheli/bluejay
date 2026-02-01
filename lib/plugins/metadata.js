import { visit } from "unist-util-visit";

export default () => {
	return (tree) => {
		let estimatedWordCount = 0;
		visit(tree, "text", (node) => {
			estimatedWordCount += node.value.split(/\s+/).length;
		});
		const __bluejayMetadata__ = {
			estimatedWordCount,
		};
		const data = {
			estree: {
				type: "Program",
				sourceType: "module",
				body: [
					{
						type: "Literal",
						raw: `export const __bluejayMetadata__ = ${JSON.stringify(__bluejayMetadata__, null, 2)}`,
					},
				],
			},
		};
		tree.children.push({
			type: "mdxjsEsm",
			data,
		});
	};
};
