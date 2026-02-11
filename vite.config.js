const react = require('@vitejs/plugin-react');
const path = require('path');

module.exports = {
    // Use relative asset paths so the app works when loaded from file:// (packaged apps)
    base: './',
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'index.html'
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
};