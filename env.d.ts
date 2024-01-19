/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_EMAIL: string;
    readonly VITE_APP_DESCRIPTION: string;
    readonly VITE_APP_DESCRIPTION_EXTENDED: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
