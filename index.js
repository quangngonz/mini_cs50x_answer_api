import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import getAllQuestions from './controllers/getAllQuestions.js';
import getRankings from './controllers/getRankings.js';

import submitAnswer from './controllers/submitAnswer.js';

import getTeamQuestions from "./controllers/getTeamQuestions.js";
import getTeamStats from "./controllers/getTeamStats.js";
import addHint from "./controllers/addHint.js";
import authenticate from "./middleware/authenticate.js";
import getTeamName from "./controllers/getTeamName.js";

// Swagger setup
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// --- Constants & Configuration ---
const ALLOWED_ORIGINS = '*'; // Change in production
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Redirect /api-docs to swagger.html
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'swagger.html'));
});

// Get all questions (without answers)
app.get('/questions', getAllQuestions);
// Get rankings
app.get('/ranking', getRankings);

// Submit an answer
app.post('/answer', ...submitAnswer);
// Add a hint
app.post('/addHint', addHint);

// Email to team_name_id
app.post('/get-team-name', authenticate, getTeamName)
// Get team questions
app.get("/team/:team_name_id/questions", getTeamQuestions);
// Get team stats
app.get("/team/:team_name_id/stats", getTeamStats);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
