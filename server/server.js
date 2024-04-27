/* ========== ENVIRONMENT VARIABLE ========== */
import * as dotenv from "dotenv";

/* ========== ACCESS TO ENVIRONMENT VARIABLES (ENV) ========== */
dotenv.config();

/* ========== CONNECTION MODULE ========== */
import express from "express";
import router from "./routes/route.js";
import cors from "cors";
import { initializeMongoClient } from "./db.js";

/* ========== CONNECT EXPRESS, CORS, COMPRESSION ========== */
const app = express();
app.use(express.json());
app.use(cors());
app.use("/", router);

/* ========== PORT ========== */
const PORT = process.env.PORT || 5001;

/* ========== SERVER LISTENING ========== */
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeMongoClient();
});
