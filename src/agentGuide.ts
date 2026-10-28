import './assets/css/main.css';

// the markup names the live app; served by the dev server, the steps point at the local one
const appUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;

document.querySelectorAll('[data-app-url]').forEach((element) => {
    element.textContent = appUrl;
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
        // the markup pairs every copy button with the code block it names
        const text = document.getElementById(button.dataset.copy!)!.textContent!;

        try {
            await navigator.clipboard.writeText(text);
            button.textContent = 'Copied';
        } catch {
            button.textContent = 'Copy failed';
        }

        setTimeout(() => (button.textContent = 'Copy'), 2000);
    });
});
