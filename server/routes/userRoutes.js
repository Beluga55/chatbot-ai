import express from "express";
import { createUser } from "../controllers/signup.js";
import { loginUser } from "../controllers/login.js";
import { verifyToken } from "../controllers/verifyToken.js";
import { updateUsername } from "../controllers/updateUsername.js";
import { uploadProfile } from "../controllers/uploadProfile.js";
import { getImage } from "../controllers/getImage.js";
import { retrieveProfilePicture } from "../controllers/retrieveProfilePicture.js";
import { deleteAccount } from "../controllers/deleteAccount.js";
import { getEmailAndStatus } from "../controllers/getEmailAndStatus.js";
import { verifyEmail, verifySignupEmail } from "../controllers/verifyEmail.js";
import { verifyEmailToken } from "../controllers/verifyEmailToken.js";
import { verifySignupEmailToken } from "../controllers/verifyEmailToken.js";
import { changePassword } from "../controllers/changePassword.js";
import { chatbot } from "../controllers/chatbot.js";
import { getTitles } from "../controllers/getTitles.js";
import { deleteSingleChat } from "../controllers/deleteSingleChat.js";
import { retrieveChatHistory } from "../controllers/retrieveChatHistory.js";
import { renameChat } from "../controllers/renameChat.js";
import { clearChat } from "../controllers/clearChat.js";
import { forgotPassword, resetPassword } from "../controllers/forgotPassword.js";
import { updatePassword } from "../controllers/updatePassword.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/verifyToken", verifyToken);
router.put("/updateUsername", updateUsername);
router.post("/uploadProfile", uploadProfile);
router.get("/getImage/:file", getImage);
router.post("/retrieveProfilePicture", retrieveProfilePicture);
router.delete("/deleteAccount", deleteAccount);
router.post("/getEmailAndStatus", getEmailAndStatus);
router.post("/verifyEmail", verifyEmail);
router.get("/verify/:id/:token", verifyEmailToken);
router.post("/verifySignupEmail", verifySignupEmail);
router.get("/verifySignup/:emailToken", verifySignupEmailToken);
router.put("/changePassword", changePassword);
router.post("/chatbot", chatbot);
router.post("/getTitles", getTitles);
router.delete("/deleteSingleChat", deleteSingleChat);
router.post("/retrieveChatHistory", retrieveChatHistory);
router.put("/renameChat", renameChat);
router.delete("/clearChat", clearChat);
router.post("/forgotPassword", forgotPassword);
router.get("/reset-password/:id/:token", resetPassword);
router.post("/updatePassword", updatePassword);


export default router;
