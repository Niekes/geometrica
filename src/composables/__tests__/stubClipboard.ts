import { vi } from 'vitest';

// vue-use captures window.navigator at import time, so the clipboard API is stubbed as
// properties on the real navigator instead of replacing the navigator global
export function stubClipboardApi(write: (items: unknown[]) => Promise<void>) {
    Object.defineProperty(window.navigator, 'clipboard', {
        value: { write },
        configurable: true
    });
    Object.defineProperty(window.navigator, 'permissions', {
        value: {
            query: async () => ({
                state: 'granted',
                addEventListener: () => {},
                removeEventListener: () => {}
            })
        },
        configurable: true
    });
    vi.stubGlobal(
        'ClipboardItem',
        class {
            init: Record<string, unknown>;
            constructor(init: Record<string, unknown>) {
                this.init = init;
            }
        }
    );
}

export function dropNavigatorProps(...props: string[]) {
    const navigatorAsRecord = window.navigator as unknown as Record<string, unknown>;
    for (const prop of props) delete navigatorAsRecord[prop];
}

// the permission query inside useClipboard settles in microtasks after the composable runs
export async function flushMicrotasks() {
    for (let i = 0; i < 5; i++) await Promise.resolve();
}
