// biome-ignore-all lint/correctness/noVoidElementsWithChildren: Not needed.

import { renderToStaticMarkup } from "preact-render-to-string";

export default (app) => {
	const blog = app.ids.blog;
	const items = app.data.blogs.map((p) => (
		<item>
			<title>{p.metadata.title}</title>
			<link>{Bun.env.BLUEJAY_URL + p.url}</link>
			<description>{p.metadata.description}</description>
			<guid>{Bun.env.BLUEJAY_URL + p.url}</guid>
			<pubDate>{new Date(p.metadata.date).toUTCString()}</pubDate>
		</item>
	));
	const feed = (
		<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
			<channel>
				<title>{blog.metadata.title}</title>
				<link>{Bun.env.BLUEJAY_URL + blog.url}</link>
				<description>{blog.metadata.description}</description>
				<atom:link href={`${Bun.env.BLUEJAY_URL}/feed.xml`} rel="self" type="application/rss+xml" />
				{items}
			</channel>
		</rss>
	);
	return `<?xml version="1.0"?>${renderToStaticMarkup(feed)}`;
};
