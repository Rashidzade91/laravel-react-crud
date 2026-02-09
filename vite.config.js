import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'; // React pluginini daxil edirik

export default defineConfig({
    plugins: [
        laravel({
            // app.js-i app.jsx olaraq dəyişəcəyik, ona görə bura jsx yazırıq
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(), // React-i aktivləşdiririk
    ],
});