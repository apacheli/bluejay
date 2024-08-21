import Bars from "@icons/Bars.svg";
import Github from "@icons/GitHub.svg";
import Helicopter from "@icons/Helicopter.svg";
import Xmark from "@icons/Xmark.svg";

const nav = [
  { href: "/bluejay/blog", text: "Blog" },
  { href: "/bluejay/community", text: "Community" },
];

const socials = [
  { href: "https://apache.li/", icon: Helicopter },
  { href: "https://github.com/apacheli/bluejay", icon: Github },
];

export default () => (
  <div class="main-header">
    <a href="/bluejay" class="main-header-title">
      <img src="/bluejay/icon.png" alt="bluejay icon" />
      <span>Bluejay</span>
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
            <a href={li.href} class="nav-button">
              {li.text}
            </a>
          </li>
        ))}
        {socials.map((li) => (
          <li>
            <a href={li.href} class="icon-hover nav-icon">
              <li.icon />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);
