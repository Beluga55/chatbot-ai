import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "");

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        about: resolve(root, "about.html"),
        chatbot: resolve(root, "chatbot.html"),
        service: resolve(root, "selectService.html"),
        faq: resolve(root, "faq.html"),
        login: resolve(root, "login.html"),
        signup: resolve(root, "signup.html"),
        admin: resolve(root, "admin.html"),
        forgotPassword: resolve(root, "forgotPassword.html"),
        resetPassword: resolve(root, "resetPassword.html"),
        scriptjs: resolve(root, "js/script.js"),
        navigation: resolve(root, "navigation.js"),
        validateSignup: resolve(root, "validateSignup.js"),
        validateLogin: resolve(root, "validateLogin.js"),
        authMiddleware: resolve(root, "authMiddleware.js"),
        retrieveEmail: resolve(root, "retrieveEmail.js"),
        collab: resolve(root, "collab.js"),
      },
    },
  },
});
