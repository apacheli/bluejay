export const time = Date.now();

const script = btoa(`const ws = new WebSocket("/${time}");

ws.addEventListener("message", (event) => {
    if (event.data === "reload") {
        location.reload();
    }
});

ws.addEventListener("open", () => {
    console.log("WebSocket opened.");
});`);

export const BLUEJAY_DEV = () => (Bun.env.BUILD_MODE === "serve" ? <script src={`data:text/javascript;base64,${script}`} /> : undefined);
