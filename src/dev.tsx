export const __WS = `/${Date.now().toString(16)}`;

const script = btoa(`const ws = new WebSocket("${__WS}");

ws.onmessage = (event) => {
    if (event.data === "reload") {
        location.reload();
    }
};

ws.onopen = () => {
    console.log("WebSocket opened.");
};`);

export const BLUEJAY_DEV = () => (Bun.env.BUILD_MODE === "serve" ? <script src={`data:text/javascript;base64,${script}`} /> : undefined);
