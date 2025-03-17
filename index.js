import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import getAllQuestions from './controllers/getAllQuestions.js';
import getRankings from './controllers/getRankings.js';
import submitAnswer from './controllers/submitAnswer.js';

// Swagger setup
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

// --- Constants & Configuration ---
const ALLOWED_ORIGINS = '*'; // Change in production
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quang Ngonz Mini CS50x Answer API',
      version: '1.0.0',
      description:
        'API for submitting answers and retrieving rankings for the Mini CS50x competition.',
    },
  },
  apis: ['./controllers/*.js'],
};

const specs = swaggerJsdoc(options);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: false,
    customSiteTitle: 'Mini CS50x API Docs', // Optional: Add a title
    swaggerOptions: {
      url: '/api-docs/swagger.json',
    },
  })
);

// *** Serve the JSON spec file ***
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Get all questions (without answers)
app.get('/questions', getAllQuestions);
// Get rankings
app.get('/ranking', getRankings);

// Submit an answer
app.post('/answer', ...submitAnswer);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
