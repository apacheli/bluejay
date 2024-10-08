import pkg from "../../../package.json" with { type: "json" };

import Bars from "@icons/Bars.svg";
import Discord from "@icons/Discord.svg";
import Github from "@icons/GitHub.svg";
import Helicopter from "@icons/Helicopter.svg";
import Xmark from "@icons/Xmark.svg";

const nav = [
    { href: `${Bun.env.BLUEJAY_PATH}/blog`, text: "Blog" },
    { href: `${Bun.env.BLUEJAY_PATH}/community`, text: "Community" },
    { href: "https://apache.li/", icon: Helicopter, text: "apache.li" },
    { href: "https://github.com/apacheli/bluejay", icon: Github, text: "GitHub" },
    { href: "https://apache.li/discord", icon: Discord, text: "Discord" },
];

export default () => (
    <div class="main-header">
        <a href={Bun.env.BLUEJAY_PATH} class="main-header-title">
            <img src={`${Bun.env.BLUEJAY_PATH}/icon.png`} alt="bluejay icon" height="48" width="48" />
            <span>Bluejay {pkg.version}</span>
        </a>
        <nav>
            <input type="checkbox" id="nav-check" />
            <label for="nav-check" class="nav-checker nav-check-o">
                <Bars class="icon-hover" />
            </label>
            <label for="nav-check" class="nav-checker nav-check-x">
                <Xmark class="icon-hover" />
            </label>
            <ul class="any-list nav-list">
                {nav.map((li) => (
                    <li>
                        <a href={li.href} class={li.icon ? "icon-hover nav-icon" : "nav-button"} aria-label={li.text}>
                            {li.icon ? <li.icon /> : li.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    </div>
);
