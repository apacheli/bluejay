export const BLUEJAY_WS = `/${Date.now().toString(16)}`;

const script = btoa(`const ws = new WebSocket("${BLUEJAY_WS}");

ws.onmessage = (event) => {
    if (event.data === "reload") {
        location.reload();
    }
};

ws.onopen = () => {
    console.log("WebSocket opened.");
};`);

export const BLUEJAY_DEV = () => (Bun.env.BLUEJAY_MODE === "serve" ? <script src={`data:text/javascript;base64,${script}`} /> : undefined);

export const BLUEJAY_DEV_HTML = Bun.env.BLUEJAY_MODE === "serve" ? `<script src="data:text/javascript;base64,${script}"></script>` : "";
