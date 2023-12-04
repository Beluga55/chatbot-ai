import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import * as dotenv from "dotenv";
import compression from "compression";
import OpenAI from "openai";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

const uri = process.env.MONGODB_KEY;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const secretKey = process.env.SECRET_KEY;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let conversationHistory = [];

async function initializeMongoClient() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

initializeMongoClient().catch(console.dir);

// Express route for handling API requests
app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const username = req.body.username;
    const status = req.body.status;
    const randomID = req.body.randomID;

    const db = client.db("Chatbot");
    const collectionUsers = db.collection("Users");

    await collectionUsers.findOne({
      username,
    });

    conversationHistory.push({ role: "user", content: prompt });

    // Include the main OpenAI logic here
    async function main() {
      let botResponse = "";
      let botTitleResponse = "";

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          ...conversationHistory,
        ],
        stream: true,
        temperature: 0,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      });

      for await (const chunk of completion) {
        if (chunk.choices[0].delta.content !== undefined) {
          conversationHistory.push({
            role: "assistant",
            content: chunk.choices[0].delta.content,
          });
          botResponse += chunk.choices[0].delta.content;
        }
      }

      // Extract the user's prompt from the conversation history
      const userPrompt = prompt;

      // Extract the assistant's response from the conversation history
      const assistantResponse = botResponse;

      if (status === false) {
        // Make a new API request to ChatGPT to generate a short title
        const titleGenerationResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Use an appropriate model for title generation
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content: `Generate a concise title with less than 10 words based on the following conversation:\n\nUser Prompt: ${userPrompt}\n`,
            },
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 20, // Adjust the value to control the length of the title
        });

        for await (const chunk of titleGenerationResponse) {
          if (chunk.choices[0].delta.content !== undefined) {
            botTitleResponse += chunk.choices[0].delta.content;
          }
        }

        // Extract the generated title from the API response
        const generatedTitle = botTitleResponse;

        const randomID = uuidv4();

        const collectionTitle = db.collection("Title");

        await collectionTitle.insertOne({
          username,
          randomID,
          generatedTitle,
        });

        const converHistory = db.collection("conversationHistory");

        await converHistory.insertOne({
          randomID,
          prompts: [userPrompt],
          responses: [assistantResponse],
        });

        // Send the title along with the API response
        res.status(200).send({
          bot: botResponse,
          generatedTitle: generatedTitle,
          assistantResponse: assistantResponse,
          randomID: randomID,
          status: status,
        });
      } else {
        const converHistory = db.collection("conversationHistory");

        const updateResult = await converHistory.updateOne(
          { randomID },
          {
            $push: {
              prompts: userPrompt,
              responses: assistantResponse,
            },
          }
        );

        if (updateResult.modifiedCount > 0) {
          console.log("Document updated successfully");
        } else {
          console.log("Document not updated");
        }

        // Send the title along with the API response
        res.status(200).send({
          bot: botResponse,
          status: status,
        });
      }

      console.log(conversationHistory);
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-1000);
      }
    }

    main().catch((error) => {
      console.error(error);

      res.status(500).send(error || "Something went wrong");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});

// Check edit database structure (role === admin ? user)
// Handle form submissions
app.post("/signup", async (req, res) => {
  try {
    const formData = req.body;

    // Assuming your form data structure is simple, adjust accordingly
    const { username, email, password } = formData;

    // Validate form data
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Invalid form data" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Insert the form data into MongoDB
    const db = client.db("Chatbot");
    const collection = db.collection("Users");

    // Create unique indexes on 'username' and 'email'
    await collection.createIndex({ username: 1 }, { unique: true });
    await collection.createIndex({ email: 1 }, { unique: true });

    // Specify the default role (in this case, 'user')
    const defaultRole = "user";

    const insert = await collection.insertOne({
      username,
      email,
      password: hashedPassword,
      role: defaultRole,
    });

    if (insert.acknowledged === true) {
      res.status(200).send({
        message: "Form submitted successfully",
      });
    } else {
      // Insertion failed
      res.status(500).json({ error: "Failed to insert data" });
    }
  } catch (error) {
    console.error("Error handling form submission:", error);

    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Email or username is already taken" });
    } else {
      // Handle other errors
      console.error("Error handling form submission:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Insert the form data into MongoDB
    const db = client.db("Chatbot");
    const collection = db.collection("Users");

    // Retrieve the user based on the provided email
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(401).send({ error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password from the Users collection
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Passwords match, login successful
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        secretKey,
        {
          expiresIn: "1h",
        }
      );

      if (user.role === "admin") {
        // If the user is an admin, include admin-specific details in the response
        res.json({
          message: "Login successful as admin",
          token,
          role: user.role,
          username: user.username,
        });
      } else {
        // If the user is not an admin, include regular user details in the response
        res.json({
          message: "Login successful as user",
          token,
          role: user.role,
          username: user.username,
        });
      }
    } else {
      // Passwords do not match
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/getAllTitles", async (req, res) => {
  const username = req.body.username;
  try {
    const db = client.db("Chatbot");
    const collection = db.collection("Title");
    const historyCollection = db.collection("conversationHistory");

    // Fetch all documents and project only the generatedTitle field
    const titleResult = await collection
      .find(
        { username: username },
        { projection: { _id: 0, generatedTitle: 1, randomID: 1 } }
      )
      .toArray();

    if (titleResult.length > 0) {
      // Extract randomIDs from the "Title" collection
      const titleRandomIDs = titleResult.map((doc) => doc.randomID);

      // Fetch documents from "conversationHistory" where randomID is in titleRandomIDs
      const historyResult = await historyCollection
        .find({ randomID: { $in: titleRandomIDs } })
        .toArray();

      if (historyResult.length > 0) {
        // If there are matching randomIDs in both collections, return titles and randomIDs
        const titlesAndRandomIDs = titleResult.map((doc) => ({
          titles: doc.generatedTitle,
          randomID: doc.randomID,
        }));

        res.json({ titlesAndRandomIDs });
      }
    } else {
      res.status(200).json({ titlesAndRandomIDs: [] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/deleteAllData", async (req, res) => {
  const username = req.body.username;
  try {
    const db = client.db("Chatbot");
    const collection = db.collection("Title");
    const converHistory = db.collection("conversationHistory");

    // Find documents in the "Title" collection with the given username
    const titleDocuments = await collection
      .find({ username: username })
      .toArray();

    // Extract randomIDs from the Title documents
    const randomIDs = titleDocuments.map((doc) => doc.randomID);

    // Delete documents in the "converHistory" collection where randomID matches
    const resultConverHistory = await converHistory.deleteMany({
      randomID: { $in: randomIDs },
    });

    // Delete all documents in the "Title" collection
    const result = await collection.deleteMany({ username: username });

    console.log(result.deletedCount, "documents deleted from Title collection");
    console.log(
      resultConverHistory.deletedCount,
      "documents deleted from converHistory collection"
    );

    res.status(204).end(); // No content success response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/retrieveHistory", async (req, res) => {
  try {
    const randomID = req.body.randomID; // Use req.query to get the randomID from the query parameters

    const db = client.db("Chatbot");
    const titleCollection = db.collection("Title");
    const historyCollection = db.collection("conversationHistory");

    const titleDocument = await titleCollection.findOne({ randomID });
    const historyDocument = await historyCollection.findOne({ randomID });

    if (titleDocument && historyDocument) {
      const prompts = historyDocument.prompts;
      const responses = historyDocument.responses;

      res.json({ randomID: randomID, prompts, responses });
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

app.post("/delOneConver", async (req, res) => {
  try {
    const randomID = req.body.titleID;

    const db = client.db("Chatbot");
    const titleCollection = db.collection("Title");
    const historyCollection = db.collection("conversationHistory");

    const titleDocument = await titleCollection.findOne({ randomID });
    const historyDocument = await historyCollection.findOne({ randomID });

    if (titleDocument && historyDocument) {
      // Delete document from Title collection
      await titleCollection.deleteOne({ randomID });

      // Delete document from conversationHistory collection
      await historyCollection.deleteOne({
        randomID,
      });

      res.status(200).json({ success: true });
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

app.post("/validateEmail", async (req, res) => {
  try {
    const email = req.body.email;

    // Make sure the email is in the database
    const db = client.db("Chatbot");
    const users = db.collection("Users");

    // Check inside the database whether it match the prompt from user
    const checkEmail = await users.findOne({ email });

    // Extract the password from the database based on the email provided
    if (checkEmail) {
      const id = checkEmail._id;
      const email = checkEmail.email;
      const password = checkEmail.password;

      // After checking we need to validate whether both email is the same
      if (email === email) {
        const secret = process.env.VALIDATE_JWT_SECRET_KEY + password;
        const payload = {
          email: email,
          id: id,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "15m" });
        const link = `http://localhost:5001/reset-password/${id}/${token}`;

        // Send the link using email (Later)
        console.log(link);

        res.status(200).json({
          message: "Link has been sent to your email",
        });
      }
    } else {
      res.status(401).json({
        message: "This user doesn't exist",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

// GET PARAMETER TO REDIRECT USERS TO THE DEDICATED PAGE
app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  // Validate the id whether it is exist
  const db = client.db("Chatbot");
  const users = db.collection("Users");

  const findID = await users.findOne({ _id: new ObjectId(id) });
  if (findID) {
    const matchingID = findID._id.toString();
    const matchingEmail = findID.email;
    const matchingPassword = findID.password;

    if (id === matchingID) {
      const secret = process.env.VALIDATE_JWT_SECRET_KEY + matchingPassword;

      try {
        const payload = jwt.verify(token, secret);

        res.send(`
    <script>
      window.location.href = 'http://localhost:5173/resetPassword.html?id=${id}&token=${token}&userEmail=${matchingEmail}';
    </script>
  `);
      } catch (error) {
        console.log(error.message);
      }
    }
  }
});

app.post("/updatePassword", async (req, res) => {
  const token = req.body.userToken;
  const newPassword = req.body.newPassword;
  const userEmail = req.body.userEmail;

  // Extract the current hashed password (assuming it has never been updated)
  const db = client.db("Chatbot");
  const users = db.collection("Users");

  const user = await users.findOne({ email: userEmail });

  if (user) {
    const oldHashedPassword = user.password;

    // CHECK THE TOKEN
    const secret = process.env.VALIDATE_JWT_SECRET_KEY + oldHashedPassword;

    try {
      const payload = jwt.verify(token, secret);

      // Check if the new password is the same as the old password
      if (await bcrypt.compare(newPassword, oldHashedPassword)) {
        return res.status(401).json({
          message: "Your current password is the same!",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      const result = await users.updateOne(
        { email: userEmail },
        { $set: { password: hashedPassword } }
      );

      if (result.modifiedCount === 1) {
        // Password updated successfully
        res.status(200).json({ message: "Password updated successfully" });
      } else {
        // Password update failed
        res.status(500).json({ error: "Failed to update password" });
      }
    } catch (error) {
      // Handle token verification failure
      console.log(error.message);
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    // User not found
    res.status(404).json({ error: "User not found" });
  }
});

app.listen(5001, () =>
  console.log("AI server started on http://localhost:5001")
);
