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

async function initializeMongoClient() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

initializeMongoClient().catch(console.dir);

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0,
      max_tokens: 400,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    res.status(200).send({
      bot: response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});

app.listen(5001, () =>
  console.log("AI server started on http://localhost:5000")
);
