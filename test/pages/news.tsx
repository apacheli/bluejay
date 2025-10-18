import type { BluejayContext } from "../../lib/lib.ts";
import { Article } from "../components/common.tsx";

export const metadata = {
	id: "blog",
	title: "News",
	description: "Static pages made easy.",
};

export default (context: BluejayContext) => {
	return (
		<>
			<h1>News</h1>
			<main>{context.app.data.blogs.map(Article)}</main>
		</>
	);
};
