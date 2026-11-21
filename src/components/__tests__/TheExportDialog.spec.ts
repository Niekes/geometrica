import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import TheExportDialog from '../TheExportDialog.vue';

// jsdom cannot show a modal; a no-op stands in
HTMLDialogElement.prototype.showModal ||= () => {};

const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"></svg>';
const link = 'https://niekes.github.io/geometrica/?l=abc';

// the export link hands the browser a blob; the stub keeps every blob that became a link
let blobs: Blob[];

beforeEach(() => {
    blobs = [];
    vi.stubGlobal('URL', {
        createObjectURL: (blob: Blob) => `blob:${blobs.push(blob)}`,
        revokeObjectURL: () => {}
    });
});

afterEach(() => vi.unstubAllGlobals());

const open = async () => {
    const wrapper = mount(TheExportDialog, { props: { svg, link, modelValue: false } });

    await wrapper.setProps({ modelValue: true });
    await flushPromises();

    return wrapper;
};

const exportLink = (wrapper: Awaited<ReturnType<typeof open>>) =>
    wrapper.findAll('a').find((a) => a.text().startsWith('Export'))!;

const fileBehind = (href: string | undefined) => blobs[Number(href!.slice('blob:'.length)) - 1]!;

describe('TheExportDialog', () => {
    it('offers the artwork as SVG that carries its link', async () => {
        const wrapper = await open();
        const anchor = exportLink(wrapper);

        expect(anchor.text()).toBe('Export SVG');
        expect(anchor.attributes('download')).toMatch(/^geometrica-.+\.svg$/);

        const file = await fileBehind(anchor.attributes('href')).text();

        expect(file).toMatch(/^<!-- Generator: Geometrica \d+\.\d+\.\d+ -->\n<svg /);
        expect(file).toContain(`<dc:source>${link.replace('&', '&amp;')}</dc:source>`);
    });

    describe('as PNG', () => {
        // jsdom draws no pictures: the browser's canvas stands in at its boundary
        const drawn: { width: number; height: number }[] = [];
        let decode: () => Promise<void>;

        beforeEach(() => {
            drawn.length = 0;
            decode = () => Promise.resolve();
            HTMLImageElement.prototype.decode = () => decode();
            vi.stubGlobal(
                'OffscreenCanvas',
                class {
                    constructor(
                        public width: number,
                        public height: number
                    ) {
                        drawn.push({ width, height });
                    }
                    getContext = () => ({ drawImage: () => {} });
                    convertToBlob = async () => new Blob(['png'], { type: 'image/png' });
                }
            );
        });

        const choose = async (wrapper: Awaited<ReturnType<typeof open>>, label: string) => {
            await wrapper
                .findAll('label')
                .find((l) => l.text().startsWith(label))!
                .find('input')
                .setValue(true);
            await flushPromises();
        };

        it('offers the artwork at the chosen size', async () => {
            const wrapper = await open();

            await choose(wrapper, 'PNG');

            expect(drawn).toEqual([{ width: 2048, height: 2048 }]);

            await choose(wrapper, '4×');

            const anchor = exportLink(wrapper);

            expect(drawn.at(-1)).toEqual({ width: 4096, height: 4096 });
            expect(anchor.text()).toBe('Export PNG');
            expect(anchor.attributes('download')).toMatch(/^geometrica-.+\.png$/);
            expect(fileBehind(anchor.attributes('href')).type).toBe('image/png');
        });

        it('says so when the browser cannot make the PNG, and offers no file', async () => {
            decode = () => Promise.reject(new Error('out of memory'));
            const wrapper = await open();

            await choose(wrapper, 'PNG');

            expect(wrapper.find('[role="alert"]').text()).toContain('could not be made');
            expect(exportLink(wrapper).attributes('href')).toBeUndefined();
        });
    });
});
