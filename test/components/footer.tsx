import { CodeIcon, GiftIcon, RssIcon } from "./icons.tsx";

const list = [
	{ class: "nav-button rss", href: "/bluejay/feed.xml", icon: RssIcon, title: "RSS Feed" },
	{ href: "https://github.com/apacheli/bluejay", icon: CodeIcon, title: "Source" },
	{ href: "https://github.com/sponsors/apacheli", icon: GiftIcon, title: "Support Us!" },
];

export default () => (
	<footer class="main-footer">
		<div class="flex-list">
			{list.map((item) => (
				<a class={item.class ?? "nav-button"} href={item.href}>
					<item.icon />
					<span class="hover-tooltip">{item.title}</span>
				</a>
			))}
		</div>
		<span>&copy; 2024-present The Bluejay Team.</span>
	</footer>
);
