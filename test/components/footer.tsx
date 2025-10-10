import { EmailIcon, RssIcon } from "./icons.tsx";

export default () => (
	<footer class="main-footer" style="text-align: center">
		<div class="flex-list">
			<a href="/feed.xml" class="nav-button rss">
				<RssIcon />
				<span class="hover-tooltip">RSS Feed</span>
			</a>
			<a href="mailto:contact@apache.li" class="nav-button">
				<EmailIcon />
				<span class="hover-tooltip">Contact Me</span>
			</a>
		</div>
		<span>&copy; 2024-present apacheli.</span>
	</footer>
);
