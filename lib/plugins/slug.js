import { visit } from "unist-util-visit";

export default () => (tree) => {
	visit(tree, "heading", (node) => {
		const slug = node.children.map((c) => c.value?.replace(/\W+/g, "-").toLowerCase()).join("");
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
