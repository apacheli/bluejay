import { visit } from "unist-util-visit";

export default () => {
	return (tree) => {
		const stack = [];

		visit(tree, "heading", (node) => {
			const text = node.children.map((c) => c.value?.replace(/\W+/g, "-").toLowerCase()).join("");

			stack[node.depth - 1] = text;
			stack.length = node.depth;

			const slug = node.depth === 1 ? stack.join("-") : stack.slice(1).join("-");

			node.children = [
				{
					children: node.children,
					data: {
						hProperties: { id: slug },
					},
					type: "link",
					url: `#${slug}`,
				},
			];
		});
	};
};
