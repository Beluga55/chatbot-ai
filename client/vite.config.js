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
        scriptjs: resolve(root, "script.js"),
        navigation: resolve(root, "navigation.js"),
        validateSignup: resolve(root, "validateSignup.js"),
        validateLogin: resolve(root, "validateLogin.js")
      },
    },
  },
});
