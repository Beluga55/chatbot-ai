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
        // faq: resolve(root, "faq.html"),
        login: resolve(root, "login.html"),
        signup: resolve(root, "signup.html"),
        admin: resolve(root, "admin.html"),
        forgotPassword: resolve(root, "forgotPassword.html"),
        resetPassword: resolve(root, "resetPassword.html"),
        pricing: resolve(root, "pricing.html"),
        success: resolve(root, "success.html"),
        swiper: resolve(root, "js/swiper.js"),
        authMiddleware: resolve(root, "js/authMiddleware.js"),
        collaboration: resolve(root, "js/collaboration.js"),
        forgotPasswordJS: resolve(root, "js/forgotPassword.js"),
        loginJS: resolve(root, "js/login.js"),
        signupJS: resolve(root, "js/signup.js"),
        navigation: resolve(root, "js/navigation.js"),
        resetPasswordJS: resolve(root, "js/resetPassword.js"),
        validateEmail: resolve(root, "js/validateEmail.js"),
        adminJS: resolve(root, "js/admin/admin.js"),
        createAndEditUser: resolve(root, "js/admin/createAndEditUser.js"),
        deleteChatHistory: resolve(root, "js/admin/deleteChatHistory.js"),
        deleteUser: resolve(root, "js/admin/deleteUser.js"),
        retrieveInformation: resolve(root, "js/admin/retrieveInformation.js"),
        changeAvatar: resolve(root, "js/chatbot/changeAvatar.js"),
        changeTextareaHeight: resolve(
          root,
          "js/chatbot/changeTextareaHeight.js"
        ),
        chatbotJS: resolve(root, "js/chatbot/chatbot.js"),
        chatStripe: resolve(root, "js/chatbot/chatStripe.js"),
        clipboard: resolve(root, "js/chatbot/clipboard.js"),
        deleteAllChat: resolve(root, "js/chatbot/deleteAllChat.js"),
        generateUniqueId: resolve(root, "js/chatbot/generateUniqueId.js"),
        newChat: resolve(root, "js/chatbot/newChat.js"),
        openai: resolve(root, "js/chatbot/openai.js"),
        openSetupMenu: resolve(root, "js/chatbot/openSetupMenu.js"),
        retrieveChatHistory: resolve(root, "js/chatbot/retrieveChatHistory.js"),
        retrieveProfilePicture: resolve(
          root,
          "js/chatbot/retrieveProfilePicture.js"
        ),
        retrieveTitle: resolve(root, "js/chatbot/retrieveTitle.js"),
        retrieveUsername: resolve(root, "js/chatbot/retrieveUsername.js"),
        uploadProfilePicture: resolve(
          root,
          "js/chatbot/uploadProfilePicture.js"
        ),
        redirectSelectService: resolve(
          root,
          "js/stripe/redirectSelectService.js"
        ),
      },
    },
  },
  server: {
    proxy: {
      "^/(index|about|pricing|chatbot|login|signup|selectService|forgotPassword|resetPassword|admin|success|cancel)":
        {
          target: "https://aichatkey.net/",
          changeOrigin: true,
        },
    },
  },
});
