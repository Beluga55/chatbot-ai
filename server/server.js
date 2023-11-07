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

          // Print the content of the chunk as it arrives
          console.log(chunk.choices[0].delta.content);

          // Send the content as it arrives
          res.write(chunk.choices[0].delta.content);
        }
      }

      // Mark the response as complete
      res.end();
      console.log(conversationHistory);

      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-500);
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

app.listen(5000, () =>
  console.log("AI server started on http://localhost:5000")
);
