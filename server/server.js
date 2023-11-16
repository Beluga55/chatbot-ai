import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import * as dotenv from "dotenv";
import compression from "compression";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

const uri = process.env.MONGODB_KEY;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    conversationHistory.push({ role: "user", content: prompt });

    // Include the main OpenAI logic here
    async function main() {
      let botResponse = "";

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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

      // Send the entire conversation history, including bot responses
      res.status(200).send({
        bot: botResponse,
      });

      console.log(conversationHistory);
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-450);
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

    // Insert the form data into MongoDB
    const db = client.db("Chatbot");
    const collection = db.collection("Users");

    await collection.insertOne({ username, email, password });

    // If you reach this point, the insertion was successful, but no response is sent to the frontend
  } catch (error) {
    console.error("Error handling form submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5001, () =>
  console.log("AI server started on http://localhost:5000")
);
