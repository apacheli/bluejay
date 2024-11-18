export const BLUEJAY_WS = `/${Date.now().toString(16)}`;

/* export */ const code = `const ws = new WebSocket("${BLUEJAY_WS}");

ws.onmessage = (event) => {
    if (event.data === "reload") {
        location.reload();
    }
};

ws.onopen = () => {
    console.log("WebSocket opened.");
};`;

export const BLUEJAY_WS_SCRIPT = `data:text/javascript;base64,${btoa(code)}`;

export const BLUEJAY_DEV = Bun.env.BLUEJAY_MODE === "serve" ? `<script src="${BLUEJAY_WS_SCRIPT}"></script>` : "";
