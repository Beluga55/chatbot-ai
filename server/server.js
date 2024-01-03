/* =========================== MODULES =========================== */

/* ========== CONNECTION MODULE ========== */
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import { ObjectId } from "mongodb";
import cors from "cors";

/* ========== API KEYS MODULE ========== */
import * as dotenv from "dotenv";

/* ========== COMPRESSION MODULE ========== */
import compression from "compression";

/* ========== CHATBOT MODULE ========== */
import OpenAI from "openai";

/* ========== SECURITY MODULE ========== */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/* ========== SEND EMAILS MODULE ========== */
import nodemailer from "nodemailer";
import { google } from "googleapis";

/* ========== UPLOAD IMAGES MODULE ========== */
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

/* ========== ACCESS TO ENVIRONMENT VARIABLES (ENV) ========== */
dotenv.config();

/* ========== CONNECT EXPRESS, CORS, COMPRESSION ========== */
const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

/* ========== EXTRACT KEYS FROM ENV FILE ========== */
const uri = process.env.MONGODB_KEY;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const secretKey = process.env.SECRET_KEY;

/* ========== CONNECTION TO MONGO DATABASE ========== */
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function initializeMongoClient() {
  try {
    await client.connect();
    console.log("Connected To MongoDB");
  } catch (error) {
    console.error("Error Connecting To MongoDB: ", error);
  }
}

initializeMongoClient().catch(console.dir);

/* ========== GLOBAL VARIABLES FOR MONGODB DATABASE, COLLECTION AND CHATBOT ARRAY ========== */
const database = client.db("Chatbot");
const title = database.collection("Title");
const users = database.collection("Users");
const converHistory = database.collection("conversationHistory");
let storedResponses = [];

/* ========== INITIALIZE GRIDFS CONFIGURATION ========== */
const storage = new GridFsStorage({
  url: uri,
  db: database,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: "uploads",
    };
  },
});

/* ========== INITIALIZE MULTER CONFIGURATION ========== */
const upload = multer({ storage: storage });

/* ====================== EXPRESS ROUTE HANDLING API REQUESTS ====================== */

/* ========== EXPRESS CHATBOT CONFIGURATION ========== */
app.post("/", async (req, res) => {
  try {
    const { prompt, username, status, randomID } = req.body;

    // CHECK RANDOM ID (MATCH OR EMPTY)
    if (randomID !== "") {
      const storedRandomID = await converHistory.findOne({ randomID });

      if (storedRandomID) {
        const matchRandomID = storedRandomID.randomID;

        // COMPARE THE RANDOM ID WITH THE EXTRACTION FROM THE DATABASE
        if (randomID === matchRandomID) {
          // EXTRACT THE RESPONSE WITH THE MATCHING RANDOM ID AND THE BOT LAST RESPONSE
          const historyResponse = await converHistory.findOne(
            { randomID },
            { latestBotResponse: 1 }
          );

          // USE LATEST RESPONSES DIRECTLY (IF AVAILABLE)
          const lastBotResponse = historyResponse?.latestBotResponse;

          // CLEAR THE ARRAY MAKE SURE IS NOT OVERLOADED
          storedResponses = [];

          // PUSH THE ASSISTANT RESPONSE FIRST THEN USER PROMPT
          if (lastBotResponse) {
            storedResponses.push({
              role: "assistant",
              content: lastBotResponse,
            });
          }

          storedResponses.push({ role: "user", content: prompt });
        }
      }
    } else {
      storedResponses = [];
      storedResponses.push({ role: "user", content: prompt });
    }

    // WHEN THE BROWSER IS REFRESHED
    if (randomID === null) {
      storedResponses = [];
      storedResponses.push({ role: "user", content: prompt });
    }

    // RETRIEVE API RESPONSE FROM OPENAI
    async function main() {
      let botResponse = "";
      let botTitleResponse = "";

      // IF EMPTY PROMPT SUBMITTED
      if (prompt.trim() === "") {
        res.status(500).send("Please provide some text...");
        return;
      }

      // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant and your name is Chatbot.",
          },
          ...storedResponses,
        ],
        stream: true,
        temperature: 0,
        max_tokens: 400,
        top_p: 1,
        frequency_penalty: 0.6,
        presence_penalty: 0.6,
      });

      // COMBINE STREAM WORDS USING FOR LOOP
      for await (const chunk of completion) {
        if (chunk.choices[0].delta.content !== undefined) {
          botResponse += chunk.choices[0].delta.content;
        }
      }

      // GENERATE TITLE BASED ON THE PROMPT
      if (status === false) {
        const titleGenerationResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant and your name is Chatbot.",
            },
            {
              role: "user",
              content: `Generate a concise title with less than 5 words based on the following conversation:\n\nUser Prompt: ${prompt}\n`,
            },
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 10,
        });

        // COMBINE STREAM WORDS USING FOR LOOP
        for await (const chunk of titleGenerationResponse) {
          if (chunk.choices[0].delta.content !== undefined) {
            botTitleResponse += chunk.choices[0].delta.content;
          }
        }

        // GENERATE A RANDOM ID FOR EACH TITLE
        const randomID = uuidv4();

        // INSERT THE REQUIRED DATA TO DATABASE
        await title.insertOne({
          username,
          randomID,
          generatedTitle: botTitleResponse,
        });

        await converHistory.insertOne({
          randomID,
          prompts: [prompt],
          responses: [botResponse],
          latestBotResponse: botResponse,
        });

        // SEND THE TITLE ALONG WITH THE API RESPONSE
        res.status(200).send({
          bot: botResponse,
          generatedTitle: botTitleResponse,
          randomID: randomID,
          status: status,
        });
      } else {
        const updateResult = await converHistory.updateOne(
          { randomID },
          {
            $push: {
              prompts: prompt,
              responses: botResponse,
            },
            $set: {
              latestBotResponse: botResponse,
            },
          }
        );

        if (updateResult.modifiedCount > 0) {
          console.log("Document updated successfully");
        } else {
          console.log("Document not updated");
        }

        // SEND THE API RESPONSE AND STATUS ONLY
        res.status(200).send({
          bot: botResponse,
          status: status,
        });
      }
    }

    // CATCH ALL ERRORS
    main().catch((error) => {
      console.error(error);
      res.status(500).send(error || "Something Went Wrong");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something Went Wrong");
  }
});

/* ========== EXPRESS LOGIN CONFIGURATION ========== */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // RETRIEVE THE USER BASED ON THE PROVIDED EMAIL
    const user = await users.findOne({ email });

    // CHECK IF THE USERS EXIST
    if (!user) {
      return res.status(401).send({ error: "Invalid email or password" });
    }

    // COMPARE THE PROVIDED PASSWORD AND HASHED PASSWORD FROM THE COLLECTION
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // ASSIGN A TOKEN UPON LOGIN SUCCESS
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        secretKey,
        { expiresIn: "1h" }
      );

      // SEND BACK THE TOKEN, ROLE AND USERNAME
      res.json({
        token,
        role: user.role,
        username: user.username,
      });
    } else {
      // PASSWORD DO NOT MATCH
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS SIGNUP CONFIGURATION ========== */
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // VALIDATE FORM DATA
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Invalid form data" });
    }

    // HASH THE PASSWORD BEFORE STORING IT
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE UNIQUE INDEXES ON USERNAME AND EMAIL
    await users.createIndex({ username: 1 }, { unique: true });
    await users.createIndex({ email: 1 }, { unique: true });

    // THE DEFAULT ROLE IS USER
    const defaultRole = "user";

    // INSERT TO DATABASE
    const insert = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      role: defaultRole,
    });

    // CHECKS WHETHER SUCCESSFULLY INSERT
    if (insert.acknowledged === true) {
      // NO CONTENT SUCCESS RESPONSE
      res.status(204).end();
    } else {
      res.status(500).json({ error: "Failed to insert data" });
    }
  } catch (error) {
    console.error("Error handling form submission:", error);

    // CHECKS DUPLLICATE EMAIL AND USERNAME
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Email or username is already taken" });
    } else {
      console.error("Error handling form submission:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
});

/* ========== EXPRESS GET ALL TITLES CONFIGURATION ========== */
app.post("/getAllTitles", async (req, res) => {
  try {
    const username = req.body.username;

    // FETCH ALL DOCUMENTS AND PROJECT THE GENERATED TITLE FIELD
    const titleResult = await title
      .find(
        { username: username },
        { projection: { _id: 0, generatedTitle: 1, randomID: 1 } }
      )
      .toArray();

    // IF THERE IS TITLES INSIDE THIS USERNAME
    if (titleResult.length > 0) {
      // MAP THE TITLES
      const titleResultArray = titleResult.map((doc) => doc.randomID);

      // FETCH DOCUMENTS FROM CONVERSATION HISTORY AND CHECK THE RANDOM ID IS SAME WITH THE TITLE RANDOM ID ON THE TITLE
      const converHistoryCollection = await converHistory
        .find({ randomID: { $in: titleResultArray } })
        .toArray();

      // IF YES, MAP ALL THE TITLES AND RANDOMID TOGETHER
      if (converHistoryCollection.length > 0) {
        const titlesAndRandomIDs = titleResult.map((doc) => ({
          titles: doc.generatedTitle,
          randomID: doc.randomID,
        }));

        // SEND BACK TO THE FRONTEND
        res.json({ titlesAndRandomIDs });
      }
    } else {
      // IF NOTHING SEND AN EMPTY ARRAY TO PREVENT ERROR
      res.status(200).json({ titlesAndRandomIDs: [] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS DELETE ALL DATA CONFIGURATION ========== */
app.delete("/deleteAllData", async (req, res) => {
  try {
    const username = req.body.username;

    // FIND DOCUMENT IN THE TITLE COLLECTION WITH THE GIVEN USERNAME
    const titleDocuments = await title.find({ username: username }).toArray();

    // EXTRACT THE DATA AND MAP THE RANDOM ID INTO A NEW ARRAY
    const randomIDs = titleDocuments.map((doc) => doc.randomID);

    // DELETE DOCUMENTS IN THE "CONVERHISTORY" COLLECTION WHERE RANDOM ID MATCHES
    await converHistory.deleteMany({
      randomID: { $in: randomIDs },
    });

    // DELETE ALL THE TITLES ASSOCIATED WITH THE USERNAME
    await title.deleteMany({ username: username });

    // NO CONTENT SUCCESS RESPONSE
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS RETRIEVE CHAT HISTORY CONFIGURATION ========== */
app.post("/retrieveHistory", async (req, res) => {
  try {
    const randomID = req.body.randomID;

    const titleDocument = await title.findOne({ randomID });
    const historyDocument = await converHistory.findOne({ randomID });

    if (titleDocument && historyDocument) {
      const prompts = historyDocument.prompts;
      const responses = historyDocument.responses;

      res.json({ randomID: randomID, prompts, responses });
    } else {
      res.status(404).json({
        error: "Random ID not found in Title or Conversation History",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS DELETE SINGLE CONVERSATION CONFIGURATION ========== */
app.post("/delOneConver", async (req, res) => {
  try {
    const randomID = req.body.titleID;

    const titleDocument = await title.findOne({ randomID });
    const historyDocument = await converHistory.findOne({ randomID });

    if (titleDocument && historyDocument) {
      // DELETE DOCUMENT FROM TITLE COLECTION AND CONVERSATION COLLECTION
      await title.deleteOne({ randomID });
      await converHistory.deleteOne({ randomID });

      // NO CONTENT SUCCESS RESPONSE
      res.status(204).end();
    } else {
      res
        .status(404)
        .json({ error: "Random ID not found in Title or conversationHistory" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS RESET PASSWORD CONFIGURATION (FUNCTION ON TOP) ========== */
async function sendResetPasswordEmail(email, link) {
  const clientID = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectURI = process.env.REDIRECT_URI;
  const refreshToken = process.env.REFRESH_TOKEN;

  // AUTHENTICATION FROM GOOGLE (OAUTH2)
  const oAuth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    redirectURI
  );

  // GET THE REFRESH TOKEN
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  // TRY TO SEND EMAIL USING NODEMAILER
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    // AUTHENTICATION FOR NODEMAILER
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "testingforchatbotai@gmail.com",
        clientId: clientID,
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
}

/* ========== STEP 1: VALIDATE EMAIL ========== */
app.post("/validateEmail", async (req, res) => {
  try {
    const email = req.body.email;

    // CHECK THE DATABASE WHETHER THIS USER EXIST
    const checkEmail = await users.findOne({ email });

    // EXTRACT THE REQUIRED DATA
    if (checkEmail) {
      const id = checkEmail._id;
      const email = checkEmail.email;
      const password = checkEmail.password;

      // CHECK THE EMAIL WHETHER IT IS SAME AND SIGN A JWT TOKEN
      if (email === email) {
        const secret = process.env.VALIDATE_JWT_SECRET_KEY + password;
        const payload = { email: email, id: id };
        const token = jwt.sign(payload, secret, { expiresIn: "15m" });
        const link = `https://chatbot-rreu.onrender.com/reset-password/${id}/${token}`;

        // SEND THE LINK USING FUNCTION
        sendResetPasswordEmail(email, link);

        res.status(200).json({ message: "Link has been sent to your email" });
      }
    } else {
      res.status(401).json({ message: "This user doesn't exist" });
    }
  } catch (error) {
    console.log("There is an error: ", error.message);
  }
});

/* ========== STEP 2: REDIRECT USERS TO DEDICATED PAGE ========== */
app.get("/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;

    // FIND ONE USER AND MATCH IT WITH THE ID FROM THE POST REQUEST
    const findID = await users.findOne({ _id: new ObjectId(id) });

    if (findID) {
      const matchingID = findID._id.toString();
      const matchingEmail = findID.email;
      const matchingPassword = findID.password;

      if (id === matchingID) {
        const secret = process.env.VALIDATE_JWT_SECRET_KEY + matchingPassword;

        try {
          // VERIFY THE JWT TOKEN
          jwt.verify(token, secret);

          res.send(`
          <script>
            window.location.href = 'https://chatbot-ai-ashy.vercel.app/resetPassword.html?id=${id}&token=${token}&userEmail=${matchingEmail}';
          </script>
          `);
        } catch (error) {
          console.log(error.message);
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
});

/* ========== STEP 3: UPDATE PASSWORD ========== */
app.post("/updatePassword", async (req, res) => {
  try {
    const { userToken, newPassword, userEmail } = req.body;

    // EXTRACT THE CURRENT HASHED PASSWORD (ASSUMING IT HAS NEVER BEEN UPDATED)
    const user = await users.findOne({ email: userEmail });

    if (user) {
      const oldHashedPassword = user.password;
      const secret = process.env.VALIDATE_JWT_SECRET_KEY + oldHashedPassword;

      try {
        jwt.verify(userToken, secret);

        // CHECK IF THE NEW PASSWORD IS SAME WITH THE OLD PASSWORD
        if (await bcrypt.compare(newPassword, oldHashedPassword)) {
          return res.status(401).json({
            message: "Your current password is the same!",
          });
        }

        // HASH AND UPDATE THE NEW PASSWORD
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await users.updateOne(
          { email: userEmail },
          { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Password updated successfully" });
        } else {
          res.status(500).json({ error: "Failed to update password" });
        }
      } catch (error) {
        console.error("Invalid token: ", error.message);
        res.status(401).json({ message: "Invalid token" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("An error occurred: ", error.message);
  }
});

/* ========== EXPRESS SEND COLLAB FORM CONFIGURATION (FUNCTION ON TOP) ========== */
async function sendCollabEmail(name, email, content) {
  const clientID = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectURI = process.env.REDIRECT_URI;
  const refreshToken = process.env.REFRESH_TOKEN;

  const oAuth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    redirectURI
  );
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "testingforchatbotai@gmail.com",
        clientId: clientID,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "CHATBOT - AI <testingforchatbotai@gmail.com>",
      to: "testingforchatbotai@gmail.com",
      subject: "Collaboration Request",
      text: "Name: " + name + "\nEmail: " + email + "\nContent: " + content,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
  }
}

/* ========== STEP 1: SEND COLLAB FORM (THE ONLY STEP) ========== */
app.post("/collabForm", async (req, res) => {
  try {
    const { name, email, content } = req.body;

    try {
      await sendCollabEmail(name, email, content);
      res.status(200).json({ message: "The form is submitted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit form" });
    }
  } catch (error) {
    console.error("Failed to send collab form: ", error.message);
  }
});

/* ========== EXPRESS UPLOAD IMAGE CONFIGURATION (NOT FINISHED) ========== */
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const image = req.file;
    if (!image) {
      return res.status(400).send("No file uploaded");
    }

    res.status(200).json({
      message: "Successfully uploaded!",
    });
  } catch (error) {
    console.error("Error handling image upload:", error);
    res.status(500).send("Error uploading image");
  }
});

app.listen(5001, () =>
  console.log("AI server started on http://localhost:5001")
);