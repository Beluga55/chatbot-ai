/* =========================== MODULES =========================== */

/* ========== CONNECTION MODULE ========== */
import express from "express";
import { MongoClient, ServerApiVersion, ObjectId, GridFSBucket } from "mongodb";
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
import fs from "fs";
import formidable from "formidable";

/* ========== PAYMENT MODULE ========== */
import Stripe from "stripe";

/* ========== ACCESS TO ENVIRONMENT VARIABLES (ENV) ========== */
dotenv.config();

/* ========== CONNECT EXPRESS, CORS, COMPRESSION ========== */
const app = express();
app.use(cors());
app.use(compression());

/* ========== GETTING WEBHOOKS FROM STRIPE API ========== */
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const payload = req.body;
    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook error:", err.message); // Log the error message
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      // EXECUTE
      const session = event.data.object;
      const username = session.metadata.username;
      const productName = session.metadata.productName;

      if (productName === "Premium plan") {
        // UPDATE THE USERS COLLECTION WITH THE NEW PLAN
        try {
          const currentUser = await users.findOne({ username });

          if (currentUser) {
            // Calculate the expiry date as 30 days from now
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            // Update the user's document with the new plan and expiry date
            await users.updateOne(
              { username: username },
              { $set: { plan: productName, expiryDate: expiryDate } }
            );

            // STORE THE ORDERS INSIDE THE ORDER COLLECTION (USERNAME, PRODUCT NAME, PRICE, DATE)
            await orders.insertOne({
              username,
              productName,
              price: session.amount_total / 100,
              date: new Date(),
            });
          }
        } catch (error) {
          console.error("Error updating user subscription:", error);
        }
      } else if (productName === "Best deals") {
        try {
          const currentUser = await users.findOne({ username });

          if (currentUser) {
            // Calculate the expiry date as 30 days from now
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 365);

            // Update the user's document with the new plan and expiry date
            await users.updateOne(
              { username: username },
              { $set: { plan: productName, expiryDate: expiryDate } }
            );

            // STORE THE ORDERS INSIDE THE ORDER COLLECTION (USERNAME, PRODUCT NAME, PRICE, DATE)
            await orders.insertOne({
              username,
              productName,
              price: session.amount_total / 100,
              date: new Date(),
            });
          }
        } catch (error) {
          console.error("Error updating user subscription:", error);
        }
      }
    }

    res.json({ received: true });
  }
);

app.use(express.json());

/* ========== EXTRACT KEYS FROM ENV FILE ========== */
const uri = process.env.MONGODB_KEY;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const secretKey = process.env.SECRET_KEY;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // CHANGE IT BACK ONCE DONE TESTING
  apiVersion: "2023-10-16",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // CHANGE IT BACK ONCE DONE TESTING

/* ========== CONNECTION TO MONGO DATABASE ========== */
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db, bucket;

async function initializeMongoClient() {
  try {
    await client.connect();
    db = client.db("Chatbot");
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
    console.log("Connected To MongoDB");
  } catch (error) {
    console.error("Error Connecting To MongoDB: ", error);
  }
}

initializeMongoClient().catch(console.dir);

/* ========== GLOBAL VARIABLES FOR MONGODB DATABASE, COLLECTION AND CHATBOT ARRAY ========== */
const database = client.db("Chatbot");
const products = database.collection("Products");
const title = database.collection("Title");
const users = database.collection("Users");
const orders = database.collection("Orders");
const converHistory = database.collection("conversationHistory");
const uploadFiles = database.collection("uploads.files");
const uploadChunks = database.collection("uploads.chunks");
let storedResponses = [];

/* ====================== EXPRESS ROUTE HANDLING API REQUESTS ====================== */

/* ========== EXPRESS CHATBOT CONFIGURATION ========== */
app.post("/", async (req, res) => {
  try {
    const { prompt, username, status, randomID, toggleSwitch } = req.body;

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

      // WE NEED TO CHECK THE PLAN OF THE USER INORDER TO USE THE APROPRIATE MODEL
      const currentUser = await users.findOne({ username });

      if (currentUser) {
        const userPlan = currentUser.plan;

        if (userPlan === "Free Plan") {
          // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant and your name is Chatbot.",
              },
              ...storedResponses,
            ],
            stream: true,
            temperature: 0,
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
        } else if (userPlan === "Premium plan") {
          if (toggleSwitch === true) {
            // USING GPT 4 MODEL
            // COMPARE THE DATE TODAY WITH THE EXPIRY DATE
            const expiryDate = new Date(currentUser.expiryDate);
            const currentDate = new Date();

            if (currentDate > expiryDate) {
              // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
              const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-1106",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant and your name is Chatbot.",
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
            } else if (currentDate < expiryDate) {
              // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
              const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant and your name is Chatbot.",
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
            }
          } else {
            // USING GPT 3.5 MODEL
            // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
            const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo-1106",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant and your name is Chatbot.",
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
          }
        } else if (userPlan === "Best deals") {
          if (toggleSwitch === true) {
            // COMPARE THE DATE TODAY WITH THE EXPIRY DATE
            const expiryDate = new Date(currentUser.expiryDate);
            const currentDate = new Date();

            if (currentDate > expiryDate) {
              // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
              const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-1106",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant and your name is Chatbot.",
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
            } else if (currentDate < expiryDate) {
              // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
              const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant and your name is Chatbot.",
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
            }
          } else {
            // USING GPT 3.5 MODEL
            // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
            const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo-1106",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant and your name is Chatbot.",
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
          }
        }

        if (userPlan === "" || userPlan === null || userPlan === undefined) {
          // WAIT THE RESPONSE FROM OPENAI (USING STREAM METHOD)
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant and your name is Chatbot.",
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
          timestamp: new Date(),
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
              timestamp: new Date(),
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
            window.location.href = 'https://aichatkey.net/resetPassword.html?id=${id}&token=${token}&userEmail=${matchingEmail}';
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

/* ========== EXPRESS UPLOAD IMAGE CONFIGURATION ========== */
app.post("/upload", async (req, res) => {
  try {
    const form = formidable({});

    // PARSE THE FORM DATA
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // EXTRACT THE IMAGE AND THE USERNAME FROM THE FIELDS
      const imageFilePath = files.image[0].filepath;
      const username = fields.username[0];
      const imageFileName = files.image[0].originalFilename;
      const imageFileType = files.image[0].mimetype;

      // EXTRACT THE FILENAME FROM THE USER COLLECTION
      const findUser = await users.findOne({ username });

      // UPLOAD THE FILES TO THE DATABASE
      const writestream = bucket.openUploadStream(imageFileName, {
        chunkSizeBytes: 1048576,
        contentType: imageFileType,
      });

      // READSTREAM
      const readstream = fs.createReadStream(imageFilePath);

      readstream.pipe(writestream);

      writestream.on("error", (error) => {
        console.error("Error uploading image:", error);
      });

      writestream.on("finish", async () => {
        console.log("Image uploaded successfully!");

        // UPDATE THE USERS COLLECTION WITH NEW IMAGE
        if (findUser) {
          // UPDATE THE USERS COLLECTION WITH NEW IMAGE
          const id = findUser._id;

          await users.updateOne(
            { _id: new ObjectId(id) },
            { $set: { profilePicture: imageFileName } }
          );
        }
      });

      // EXTRACT THE profilePicture FIELD FROM USER COLLECTION
      const profilePictureFromUsersCollection = findUser.profilePicture;

      console.log(profilePictureFromUsersCollection);

      if (profilePictureFromUsersCollection) {
        // EXTRACT THE FILENAME FROM THE UPLOAD.FILES COLLECTION
        const imageFileNameFromDB = await uploadFiles.findOne({
          filename: profilePictureFromUsersCollection,
        });

        // EXTRACT THE profilePicture FIELD FROM UPLOAD.FILES COLLECTION
        if (imageFileNameFromDB) {
          const profilePictureFromUploadCollection =
            imageFileNameFromDB.filename;

          // COMPARE THE BOTH COLLECTIONS
          if (
            profilePictureFromUsersCollection ===
            profilePictureFromUploadCollection
          ) {
            // EXTRACT THE _ID FROM THE UPLOAD.FILES COLLECTION
            const id = imageFileNameFromDB._id;

            // FIND ALL THE CHUNKS USING THE ID ABOVE
            await uploadChunks.find({ files_id: id }).toArray();

            // DELETE ALL THE CHUNKS THAT MATCHES THE ID
            await uploadFiles.deleteOne({ _id: new ObjectId(id) });
            await uploadChunks.deleteMany({ files_id: id });
          }
        }
      }

      res
        .status(200)
        .json({ message: "Image uploaded successfully", file: imageFileName });
    });
  } catch (error) {
    console.error("Error handling image upload:", error);
    res.status(500).send("Error uploading image");
  }
});

/* ========== EXPRESS RETRIEVE IMAGE FROM DATABASE  ========== */
app.get("/image/:file", async (req, res) => {
  try {
    const file = req.params.file;
    const files = await bucket.find({ filename: file }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    if (
      files[0].contentType === "image/jpeg" ||
      files[0].contentType === "image/png"
    ) {
      res.set("Content-Type", files[0].contentType);
      const readstream = bucket.openDownloadStreamByName(file);
      readstream.pipe(res);
    } else {
      console.error("Not an image:", files[0].contentType);
      res.status(404).json({ error: "Not an image" });
    }
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).send("Error retrieving image");
  }
});

/* ========== EXPRESS RETRIEVE IMAGE WHEN LOADED FROM DATABASE  ========== */
app.post("/retrieveProfilePicture", async (req, res) => {
  try {
    const username = req.body.username;

    // FIND THE profilePicture IN THE USER COLLECTION
    const findUser = await users.findOne({ username });
    const profilePicture = findUser.profilePicture;

    if (profilePicture) {
      // FIND THE filename USING THE profilePicture FROM THE UPLOAD.FILES COLLECTION
      const findImage = await uploadFiles.findOne({ filename: profilePicture });
      const imageFileName = findImage.filename;

      // CHECK IF THE profilePicture IS SAME WITH THE filename
      if (profilePicture === imageFileName) {
        // EXTRACT THE IMAGES USING GFS
        const files = await bucket.find({ filename: imageFileName }).toArray();
        if (!files || files.length === 0) {
          return res.status(404).json({ error: "File not found" });
        }
        if (
          files[0].contentType === "image/jpeg" ||
          files[0].contentType === "image/png"
        ) {
          res.set("Content-Type", files[0].contentType);
          const readstream = bucket.openDownloadStreamByName(imageFileName);
          readstream.pipe(res);
        } else {
          res.status(404).json({ error: "Not an image" });
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).send("Error retrieving image");
  }
});

/* ========== EXPRESS RETRIEVE ALL USERS FROM DATABASE (ADMIN)  ========== */
app.get("/retrieveUsersAdmin", async (req, res) => {
  try {
    const usersCollection = await users.find().toArray();

    // LIMIT THE usersCollection to 15
    const limitedUsersCollection = usersCollection.slice(0, 15);

    if (limitedUsersCollection.length > 0) {
      res.json({ usersCollection: limitedUsersCollection });
    } else {
      res.status(404).json({ error: "No users found" });
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).send("Error retrieving users");
  }
});

/* ========== EXPRESS CREATE NEW USERS FROM DATABASE (ADMIN)  ========== */
app.post("/adminCreateUser", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // VALIDATE FORM DATA
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "Invalid form data" });
    }

    // HASH THE PASSWORD BEFORE STORING IT
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE UNIQUE INDEXES ON USERNAME AND EMAIL
    await users.createIndex({ username: 1 }, { unique: true });
    await users.createIndex({ email: 1 }, { unique: true });

    // INSERT TO DATABASE
    const insert = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // CHECKS WHETHER SUCCESSFULLY INSERT
    if (insert.acknowledged === true) {
      res.status(201).json({ message: "User created successfully" });
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

/* ========== EXPRESS EDIT USERS ON DATABASE (ADMIN)  ========== */
app.put("/adminEditUser", async (req, res) => {
  try {
    const { objectID, username, email, password, role } = req.body;

    // VALIDATE FORM DATA
    if (!objectID || !username || !email || !role) {
      return res.status(400).json({ error: "Invalid form data" });
    }

    // IF PASSWORD IS EMPTY, DO NOT UPDATE THE PASSWORD
    if (password === "") {
      // UPDATE THE DATABASE
      const update = await users.updateOne(
        { _id: new ObjectId(objectID) },
        {
          $set: {
            username: username,
            email: email,
            role: role,
          },
        }
      );

      // CHECKS WHETHER SUCCESSFULLY UPDATE
      if (update.modifiedCount === 1) {
        res.status(200).json({ message: "User updated successfully" });
      } else {
        res.status(500).json({ error: "Failed to update data" });
      }
    } else {
      // HASH THE PASSWORD BEFORE STORING IT
      const hashedPassword = await bcrypt.hash(password, 10);

      // UPDATE THE DATABASE
      const update = await users.updateOne(
        { _id: new ObjectId(objectID) },
        {
          $set: {
            username: username,
            email: email,
            password: hashedPassword,
            role: role,
          },
        }
      );
      // CHECKS WHETHER SUCCESSFULLY UPDATE
      if (update.modifiedCount === 1) {
        res.status(200).json({ message: "User updated successfully" });
      } else {
        res.status(500).json({ error: "Failed to update data" });
      }
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

/* ========== EXPRESS DELETE USERS FROM DATABASE (ADMIN)  ========== */
app.delete("/adminDeleteUser", async (req, res) => {
  try {
    const objectID = req.body.objectID;

    // WE NEED TO DELETE THE TITLE THAT GENERATED BY THAT USER AND ALSO THE HISTORY ABOUT IT
    // EXTRACT THE username FROM THE USERS COLLECTION
    const findUser = await users.findOne({ _id: new ObjectId(objectID) });
    const username = findUser.username;

    // FIND ALL THE TITLE GENERATED BY THAT USER
    // EXTRACT THE randomID FROM THE TITLE COLLECTION
    const titleDocuments = await title.find({ username: username }).toArray();
    const randomIDs = titleDocuments.map((doc) => doc.randomID);

    // DELETE DOCUMENTS IN THE "CONVERHISTORY" COLLECTION WHERE RANDOM ID MATCHES
    await converHistory.deleteMany({
      randomID: { $in: randomIDs },
    });

    // DELETE ALL THE TITLE ALSO FROM THE TITLE COLLECTION
    await title.deleteMany({ username: username });

    // DELETE DOCUMENTS IN THE "USERS" COLLECTION WHERE OBJECT ID MATCHES
    await users.deleteOne({ _id: new ObjectId(objectID) });

    // SUCCESS RESPONSE
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS CHAT HISTORY FROM DATABASE (ADMIN)  ========== */
app.get("/retrieveChatHistoryAdmin", async (req, res) => {
  try {
    const usersCollection = await users.find().toArray();
    const usernames = usersCollection.map((doc) => doc.username);

    const chatHistoryPromises = usernames.map(async (username) => {
      const titleAndRandomIDs = await title
        .find({ username: username })
        .toArray();

      if (!titleAndRandomIDs.length) {
        return null;
      }

      const chatDataPromises = titleAndRandomIDs.map(
        async (titleAndRandomID) => {
          const { generatedTitle, randomID } = titleAndRandomID;

          const converHistoryDocuments = await converHistory
            .find({ randomID: randomID })
            .toArray();

          const prompts = converHistoryDocuments.map((doc) => doc.prompts);
          const responses = converHistoryDocuments.map((doc) => doc.responses);
          const timestamp = converHistoryDocuments.map((doc) => doc.timestamp);

          return {
            username: username,
            title: generatedTitle,
            prompts: prompts,
            responses: responses,
            timestamp: timestamp,
          };
        }
      );

      // Wait for all chat data promises to resolve
      const chatData = await Promise.all(chatDataPromises);
      return chatData;
    });

    const completedChatHistory = await Promise.all(chatHistoryPromises);
    const filteredChatHistory = completedChatHistory
      .flat()
      .filter((item) => item !== null);

    // Limit the output to 15 items
    const limitedChatHistory = filteredChatHistory.slice(0, 15);

    res.json({ chatHistory: limitedChatHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS DELETE CHAT HISTORY FROM DATABASE (ADMIN)  ========== */
app.delete("/adminDeleteChatHistory", async (req, res) => {
  try {
    const clientTitles = req.body.clientTitle;

    // FIND THE RANDOM ID
    const findRandomID = await title.findOne({ generatedTitle: clientTitles });
    const randomID = findRandomID.randomID;

    // DELETE DOCUMENTS IN THE "CONVERHISTORY" COLLECTION WHERE RANDOM ID MATCHES
    await converHistory.deleteOne({
      randomID: randomID,
    });

    await title.deleteOne({
      randomID: randomID,
    });

    // SUCCESS RESPONSE
    res.status(200).json({ message: "Chat history deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS STRIPE API CHECKOUT SESSION  ========== */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { productName, username } = req.body;

    if (!username) {
      return res.status(404).json({ error: "User not found" });
    }

    // CHECK THE PLAN NAME
    const user = await users.findOne({ username });
    const expiryDate = new Date(user.expiryDate);

    if (expiryDate > new Date()) {
      return res
        .status(404)
        .json({ error: "Your current plan has not expired" });
    }

    // GET THE PRICE FROM THE DATABASE
    const productPrice = await products.findOne({ productName });

    // EXTRACT THE PRICE
    const price = productPrice.price;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
            },
            unit_amount: price * 100, // Stripe expects the amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        username: username,
        productName: productName,
      },
      success_url:
        "https://aichatkey.net/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        "https://aichatkey.net/cancel.html?session_id={CHECKOUT_SESSION_ID}",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS RETRIEVE SUBSCRIPTION DATE  ========== */
app.post("/retrieve-subscription-date", async (req, res) => {
  try {
    const username = req.body.username;

    // FIND THE USERNAME IN THE DATABASE
    const findUser = await users.findOne({ username });

    if (findUser) {
      const expiryDate = findUser.expiryDate;
      const currentPlan = findUser.plan;

      // COMPARE IT AND CHANGE IT TO DAYS
      const currentDate = new Date();
      const expiryDateInDays = new Date(expiryDate);
      const differenceInTime =
        expiryDateInDays.getTime() - currentDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);

      // MAKE IT TO NO DECIMAL PLACES
      const roundedDays = Math.round(differenceInDays);

      // CHECK WHETHER IT IS EXPIRE OR NOT
      if (roundedDays > 0) {
        res.status(200).json({ roundedDays });
      } else {
        // SEND THE ROUNDED DAYS TO 0
        res.status(200).json({ plan: currentPlan, roundedDays: 0 });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== EXPRESS CHECK PLAN  ========== */
app.post("/checkPlan", async (req, res) => {
  try {
    const username = req.body.username;

    // FIND THE USERNAME IN THE DATABASE
    const findUser = await users.findOne({ username });

    if (findUser) {
      const plan = findUser.plan;

      res.status(200).json({ plan });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5001, () =>
  console.log("AI server started on https://chatbot-rreu.onrender.com")
);
