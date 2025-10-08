import type { BluejayContext } from "../../lib/lib.ts";
import { Article } from "../components/common.tsx";
import { RssIcon } from "../components/icons.tsx";

export const metadata = {
	id: "blog",
	title: "Blog",
	description: "The blog page.",
};

export default (context: BluejayContext) => {
	return (
		<>
			<h1>Blog</h1>
			<main>{context.app.data.blogs.map(Article)}</main>
			<div class="icon-links">
				<a href="/feed.xml" class="icon-link rss" title="RSS Feed">
					<RssIcon />
					<span>RSS Feed</span>
				</a>
			</div>
		</>
	);
};
