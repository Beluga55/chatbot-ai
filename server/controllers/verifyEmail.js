import jwt from "jsonwebtoken";
import { User } from "../db.js";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";

dotenv.config();

const sendEmail = async (email, link) => {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "testingforchatbotai@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "CHATBOT - AI <testingforchatbotai@gmail.com>",
      to: email,
      subject: "Email Verification Link",
      text: `Click on the following link verify your email: ${link},`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
  }
};

export const verifyEmail = async (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Access Denied" });

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.SECRET_KEY);

    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { _id, email } = user;
    const id = _id.toString();
    const payload = { id };
    const emailToken = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    const link = `http://localhost:5001/users/verify/${id}/${emailToken}`;

    sendEmail(email, link);

    res.status(200).json({ message: "Link has been sent to your email" });
  } catch (error) {
    console.log("There is an error: ", error.message);
  }
};

export const verifySignupEmail = async (req, res) => {
  const { email, username } = req.body;

  let payload = {};

  if (username !== "") {
    payload = { email: email, username: username };
  } else {
    payload = { email: email };
  }

  const emailToken = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "15m",
  });

  const link = `http://localhost:5001/users/verifySignup/${emailToken}`;

  sendEmail(email, link);

  res.status(200).json({ message: "Link has been sent to your email" });
};
