import { defineConfig } from 'vite'
import { resolve } from 'path'

const root = resolve(__dirname, '')

// INCLUDE THE HTML AND JAVASCRIPT FILES ONLY
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        about: resolve(root, 'about.html'),
        user: resolve(root, 'user.html'),
        password: resolve(root, 'password.html'),
        feedback: resolve(root, 'feedback.html'),
        dashboard: resolve(root, 'dashboard.html'),
        verifyEmail: resolve(root, 'verifyEmail.html'),
        forgotPassword: resolve(root, 'forgot-password.html'),
        signup: resolve(root, 'signup.html'),
        login: resolve(root, 'login.html'),
        resetPassword: resolve(root, 'resetPassword.html'),
        faq: resolve(root, 'faq.html'),
        admin: resolve(root, 'admin.html'),
        navbar: resolve(root, 'javascript/navbar.js'),
        faqJS: resolve(root, 'javascript/faq.js'),
        redirection: resolve(root, 'javascript/redirection.js'),
        signupValidation: resolve(root, 'javascript/signupValidation.js'),
        validateEmail: resolve(root, 'javascript/validateEmail.js'),
        loginValidation: resolve(root, 'javascript/loginValidation.js'),
        dashboardJS: resolve(root, 'javascript/dashboard.js'),
        settings: resolve(root, 'javascript/settings.js'),
        authMiddleware: resolve(root, 'javascript/authMiddleware.js'),
        scrollReveal: resolve(root, 'javascript/scrollReveal.js'),
        emailParams: resolve(root, 'javascript/emailParams.js'),
        forgotPasswordJS: resolve(root, 'javascript/forgotPassword.js'),
        notfyInstance: resolve(root, 'javascript/notyfInstance.js'),
        swiperAbout: resolve(root, 'javascript/swiperAbout.js'),
        adminJS: resolve(root, 'javascript/admin/admin.js'),
        createAndEditUser: resolve(root, 'javascript/admin/createAndEditUser.js'),
        deleteUser: resolve(root, 'javascript/admin/deleteUser.js'),
        deleteChatHistory: resolve(root, 'javascript/admin/deleteChatHistory.js'),
        retrieveInformation: resolve(root, 'javascript/admin/retrieveInformation.js'),
      },
    },
  },
})