/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_EMAIL: string;
    readonly VITE_APP_DESCRIPTION: string;
    // where the app is served, ending in a slash; .env.production and .env.development set it
    readonly VITE_APP_URL: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// the part of WebMCP (https://webmachinelearning.github.io/webmcp/) the app uses; Chrome ships it
// behind chrome://flags/#enable-webmcp-testing, or --enable-features=WebMCP on the command line
interface ModelContextTool {
    name: string;
    description: string;
    inputSchema?: object;
    annotations?: { readOnlyHint?: boolean };
    execute(input: Record<string, unknown>): Promise<unknown>;
}

interface Document {
    modelContext?: {
        registerTool(tool: ModelContextTool, options?: { signal?: AbortSignal }): unknown;
    };
}
