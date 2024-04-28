import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "");

// INCLUDE THE HTML AND JAVASCRIPT FILES ONLY
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index"),
        about: resolve(root, "about"),
        user: resolve(root, "user"),
        dashboard: resolve(root, "dashboard"),
        verifyEmail: resolve(root, "verifyEmail"),
        forgotPassword: resolve(root, "forgot-password"),
        signup: resolve(root, "signup"),
        login: resolve(root, "login"),
        navbar: resolve(root, "javascript/navbar.js"),
        redirection: resolve(root, "javascript/redirection.js"),
        signupValidation: resolve(root, "javascript/signupValidation.js"),
        validateEmail: resolve(root, "javascript/validateEmail.js"),
        loginValidation: resolve(root, "javascript/loginValidation.js"),
        dashboardJS: resolve(root, "javascript/dashboard.js"),
        settings: resolve(root, "javascript/settings.js"),
        authMiddleware: resolve(root, "javascript/authMiddleware.js"),
        scrollReveal: resolve(root, "javascript/scrollReveal.js"),
        emailParams: resolve(root, "javascript/emailParams.js"),
        forgotPasswordJS: resolve(root, "javascript/forgotPassword.js"),
      },
    },
  },
});
