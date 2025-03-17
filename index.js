import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import getAllQuestions from './controllers/getAllQuestions.js';
import getRankings from './controllers/getRankings.js';
import submitAnswer from './controllers/submitAnswer.js';

// Swagger setup
import swaggerUi from 'swagger-ui-express';
import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

dotenv.config();

const app = express();

// --- Constants & Configuration ---
const ALLOWED_ORIGINS = '*'; // Change in production
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerSpec = JSON.parse(
  readFileSync(join(__dirname, 'swagger.json'), 'utf-8')
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Get all questions (without answers)
app.get('/questions', getAllQuestions);
// Get rankings
app.get('/ranking', getRankings);

// Submit an answer
app.post('/answer', ...submitAnswer);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
