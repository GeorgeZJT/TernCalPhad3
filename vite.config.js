import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [ mkcert() ],
  server: {
    https: true,     // 🍃 self-signed cert auto-generated each run
    host: true,      // ⇢ listen on 0.0.0.0 so Oculus can reach you
    port: 3001       // ⇢ or whatever port you like
  }
});
