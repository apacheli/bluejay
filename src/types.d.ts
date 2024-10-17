declare namespace NodeJS {
    interface ProcessEnv {
        BLUEJAY_MODE: "build" | "serve";
        BLUEJAY_PATH: string;
        BLUEJAY_PORT: string;
    }
}
