import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  root,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        about: resolve(root, "about.html"),
        chatbot: resolve(root, "chatbot.html"),
        faq: resolve(root, "faq.html"),
        login: resolve(root, "login.html"),
        signup: resolve(root, "signup.html"),
        styleCss: resolve(root, 'public', 'css', 'style.css'),
        chatbotCss: resolve(root, 'public', 'css', 'chatbot.css'),
      },
    },
  },
});
