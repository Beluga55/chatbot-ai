import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "");

// INCLUDE THE HTML AND JAVASCRIPT FILES ONLY
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        about: resolve(root, "about.html"),
        user: resolve(root, "user.html"),
        dashboard: resolve(root, "dashboard.html"),
        verifyEmail: resolve(root, "verifyEmail.html"),
        forgotPassword: resolve(root, "forgot-password.html"),
        signup: resolve(root, "signup.html"),
        login: resolve(root, "login.html"),
        resetPassword: resolve(root, "resetPassword.html"),
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