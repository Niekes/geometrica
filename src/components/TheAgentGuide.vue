<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import BaseTerminal from './BaseTerminal.vue';

const showAgentGuide = defineModel<boolean>({ default: false });

const install =
    'claude mcp add --scope user chrome-devtools -- npx -y chrome-devtools-mcp@latest --categoryExperimentalWebmcp=true --chromeArg=--enable-features=WebMCP';

// where the app really runs, such as another dev server port or a fork
const prompt = `Open ${window.location.origin}${import.meta.env.BASE_URL} and draw a tunnel of twenty rounded squares spiralling inwards in magma colors.`;
</script>

<template>
    <BaseModal v-model="showAgentGuide">
        <template #title>Use Geometrica with an AI agent</template>
        <div class="flex flex-col gap-6">
            <p>Describe the artwork you want, and an AI agent composes the layers for you.</p>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">How it works</h4>
                <p>
                    Geometrica runs entirely in your browser and offers its tools to AI agents
                    through
                    <a class="link" href="https://webmachinelearning.github.io/webmcp/">WebMCP</a>;
                    there is no Geometrica server. Claude Code reaches into the browser through
                    <a class="link" href="https://github.com/ChromeDevTools/chrome-devtools-mcp"
                        >Chrome DevTools MCP</a
                    >, a small helper that runs on your machine via Node.js and opens its own Chrome
                    window.
                </p>
            </section>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">You need</h4>
                <ul class="list-disc pl-6">
                    <li>
                        <a class="link" href="https://code.claude.com/docs/en/overview"
                            >Claude Code</a
                        >
                    </li>
                    <li>Chrome 150 or later</li>
                    <li><a class="link" href="https://nodejs.org/">Node.js</a></li>
                </ul>
            </section>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">1. Connect Claude Code</h4>
                <p>Run this once in a terminal:</p>
                <BaseTerminal prefix="$" :code="install" />
                <p>
                    In a running session, run <code>/mcp</code> to connect, or restart Claude Code.
                </p>
                <p class="text-sm text-base-content/70">
                    Working on Geometrica itself? Claude Code started in the repository offers the
                    helper from <code>.mcp.json</code>, so you can skip this step.
                </p>
            </section>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">2. Ask for an artwork</h4>
                <p>Tell Claude Code where Geometrica is and what you want:</p>
                <BaseTerminal prefix=">" :code="prompt" />
                <p>
                    The browser's back button undoes the agent's changes, except the first one after
                    opening Geometrica without a link.
                </p>
            </section>
        </div>
    </BaseModal>
</template>
