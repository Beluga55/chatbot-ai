import {GridFSBucket, MongoClient, ServerApiVersion} from "mongodb";
import * as dotenv from "dotenv";

/* ========== ACCESS TO ENVIRONMENT VARIABLES (ENV) ========== */
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function initializeMongoClient() {
  let bucket = "";
  try {
    await client.connect();
    bucket = new GridFSBucket(db, {bucketName: "images"});
    console.log("Connected To MongoDB");
  } catch (error) {
    console.error("Error Connecting To MongoDB: ", error);
  }
  return bucket;
}

export const db = client.db("Chatbotv2");
export const User = db.collection("Users");
export const Title = db.collection("Titles");
export const Chat = db.collection("Chats");
export const imageFiles = db.collection("images.files");
export const imageChunks = db.collection("images.chunks");
export const Feedback = db.collection("Feedback");
