import type { BluejayContext } from "../../lib/lib.ts";
import { Article } from "../components/common.tsx";

export const metadata = {
	title: "Blog",
	description: "The blog page.",
};

export default (context: BluejayContext) => {
	return (
		<>
			<h1>Blog</h1>
			<div>{context.app.data.blogs.map(Article)}</div>
		</>
	);
};
