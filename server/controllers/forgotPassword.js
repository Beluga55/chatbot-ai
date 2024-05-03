import { User } from "../db.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";

dotenv.config();

// SEND EMAIL FUNCTION CONFIGURATION
const sendResetPasswordEmail = async (email, link) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectURI = process.env.REDIRECT_URI;
  const refreshToken = process.env.REFRESH_TOKEN;

  // AUTHENTICATION FROM GOOGLE (OAUTH2)
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURI
  );

  // GET THE REFRESH TOKEN
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  // TRY TO SEND EMAIL USING NODEMAILER
  try {
    const accessToken = oAuth2Client.getAccessToken();

    // AUTHENTICATION FOR NODEMAILER
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "testingforchatbotai@gmail.com",
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
    });

    // DEFINE NODEMAILER CONFIGURATION
    const mailOptions = {
      from: "CHATBOT - AI <testingforchatbotai@gmail.com>",
      to: email,
      subject: "Password Reset Link",
      text: `Click on the following link to reset your password: ${link},`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // CHECK IF EMAIL EXISTS
    const user = await User.findOne({ email });

    // EXTRACT THE REQUIRED DATA
    if (user) {
      const id = user._id;
      const email = user.email;
      const password = user.password;

      if (email === email) {
        const secret = process.env.VALIDATE_JWT_SECRET_KEY + password;
        const payload = { email: email, id: id };
        const token = jwt.sign(payload, secret, { expiresIn: "15m" });
        const link = `https://chatbot-rreu.onrender.com/users/reset-password/${id}/${token}`; // NEED TO CHANGE TO PRODUCTION URL LATER

        // SEND THE LINK USING FUNCTION
        sendResetPasswordEmail(email, link);

        res.status(200).json({ message: "Password reset link sent to email." });
      }
    } else {
      res.status(404).json({ message: "Email not registered." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;

    // FIND ONE USER AND MATCH IT WITH THE ID FROM THE POST REQUEST
    const user = await User.findOne({ _id: new ObjectId(id) });

    // CHECK IF USER EXISTS
    if (user) {
      const matchingID = user._id.toString();
      const matchingEmail = user.email;
      const matchingPassword = user.password;

      if (id === matchingID) {
        const secret = process.env.VALIDATE_JWT_SECRET_KEY + matchingPassword;

        try {
          jwt.verify(token, secret);

          var userId = btoa(id);
          var userToken = btoa(token);
          var userEmail = btoa(matchingEmail);

          res.send(`
             <script>
               window.location.href = 'https://aichatkey.net/resetPassword?id=${userId}&token=${userToken}&userEmail=${userEmail}';
             </script>
           `);
        } catch (error) {
          res.send(
            `<script>
              alert("Invalid Signature");
            </script>`
          );
        }
      }
    }
  } catch (error) {
    console.error("There is an error occurred: ", error.message);
  }
};
