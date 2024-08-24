import pkg from "../../../package.json" with { type: "json" };

export default () => (
    <div class="main-footer">
        <span>
            Bluejay <strong>{pkg.version}</strong>
        </span>
        <span>
            Bun <strong>{Bun.version}</strong>
        </span>
        <span>&copy; 2024-present apacheli</span>
    </div>
);
