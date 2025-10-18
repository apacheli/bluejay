import { DiscordIcon, GitHubIcon, MenuCloseIcon, MenuOpenIcon } from "./icons.tsx";

const nav = [
	{ href: "/bluejay", name: "Home" },
	{ href: "/bluejay/documentation", name: "Documentation" },
	{ href: "/bluejay/news", name: "News" },
	{ href: "https://github.com/apacheli/bluejay", name: "GitHub", icon: GitHubIcon },
	{ href: "/discord", name: "Chat With Us!", icon: DiscordIcon, class: "nav-button discord" },
];

export default () => (
	<>
		<header class="main-header">
			<a href="/bluejay" class="main-header-title">
				<img src="/bluejay/assets/images/icon.png" height="48" width="48" alt="Bluejay Icon" />
				<span>Bluejay</span>
			</a>
			<input type="checkbox" id="nav-checkbox" />
			<label for="nav-checkbox" class="nav-check open">
				<MenuOpenIcon />
			</label>
			<label for="nav-checkbox" class="nav-check close">
				<MenuCloseIcon />
			</label>
			<nav class="main-header-nav">
				<ul class="flex-list">
					{nav.map((item) => (
						<li>
							<a href={item.href} class={item.class ?? "nav-button"}>
								{item.icon && <item.icon />}
								{item.icon ? <span class="hover-tooltip">{item.name}</span> : item.name}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</header>
	</>
);
