import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import getAllQuestions from "./controllers/getAllQuestions.js";
import getRankings from "./controllers/getRankings.js";
import submitAnswer from "./controllers/submitAnswer.js";


const app = express();

// --- Constants & Configuration ---
const ALLOWED_ORIGINS = "*"; // Change in production
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Get all questions (without answers)
app.get("/questions", getAllQuestions);
// Get rankings
app.get("/ranking", getRankings);

// Submit an answer
app.post("/answer", submitAnswer);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
