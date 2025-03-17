# Mini CS50x Answer API

This API provides endpoints for submission to ISPH Mini CS50x Puzzle Day, allowing users to submit answers to questions, retrieve questions, and view team rankings. It's built with Node.js, Express, and Supabase.

## Directory Structure

```plaintext
quangngonz-mini_cs50x_answer_api/
├── index.js # Main application file
├── package.json # Node.js dependencies and scripts
├── vercel.json # Vercel deployment configuration
├── controllers/ # Request handlers
│ ├── getAllQuestions.js # Get all questions (without answers)
│ ├── getRankings.js # Get team rankings
│ └── submitAnswer.js # Submit an answer and check correctness
├── services/
│ └── supabaseService.js # Supabase client setup
└── utils/ # (Currently Empty) Utility functions (if any)
```

## Endpoints

- **GET `/questions`**: Retrieves all questions, including their `id`, `question` text, and `star_rating`. Answers are _not_ included. Questions are sorted by ID.

- **GET `/ranking`**: Retrieves the current team rankings. Rankings are sorted first by score (sum of question star ratings for solved questions) and then by the timestamp of the latest correct submission. The returned data includes `team_name`, `solves` (an array containing two sub-arrays, boolean `solves` for each problem and timestamps for the solves), `score`, and `latestSolve` (timestamp in GMT+7).

- **POST `/answer`**: Submits an answer for a specific question. Requires a JSON body with:
  - `team_name_id`: The ID of the submitting team.
  - `question_id`: The ID of the question being answered.
  - `answer`: The submitted answer (case-insensitive, whitespace is trimmed and ignored).
    Returns `{ correct: true }` or `{ correct: false }` indicating the answer's correctness. Logs all submissions (correct or incorrect) to a Supabase table.

## Setup and Configuration

1.  **Environment Variables:**

    - Create a `.env` file in the root directory.
    - Define `SUPABASE_URL` and `SUPABASE_KEY` with your Supabase project credentials. These are _required_.
    - `PORT`: (Optional) The port the server will listen on (defaults to 3000).

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Run the Server:**

    - **Development:** `npm run dev` (uses `nodemon` for automatic restarts)
    - **Production:** `npm start`

4.  **Database:**
    This project uses Supabase. You'll need to create the following tables:

    - `questions`:
      - `id` (integer, primary key)
      - `question` (text)
      - `answer` (text) - The correct answer (whitespace and case are significant in the database, but the API handles variations in the submission)
      - `star_rating` (integer)
    - `teams_progress`:
      - `team_name_id` (text, primary key)
      - `solves` (boolean array) - An array indicating which questions have been solved by the team (e.g., `[false, true, false]` means question 2 is solved).
      - `timestamps` (timestamp array) - An array of timestamps corresponding to solved questions. Use `null` for unsolved questions.
    - `submissions`:
      - `id` (integer, primary key, auto-increment)
      - `team_name_id` (text)
      - `question_id` (integer)
      - `answer` (text)
      - `submitted_at` (timestamp)
      - `correct` (boolean)

## Deployment (Vercel)

The `vercel.json` file is included for easy deployment to Vercel. Simply link your repository to a Vercel project and it should deploy automatically. Make sure to set the environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) in your Vercel project settings.

### Generating swagger.json file

Due to vercel deployment, the swagger.json file is not included in the repository. To generate the file, run the following command:

```bash
node -e "require('fs').writeFileSync('./public/swagger.json', JSON.stringify(require('swagger-jsdoc')({ definition: { openapi: '3.0.0', info: { title: 'Mini CS50x Answer API', version: '1.0.0', description: 'API for submitting answers and retrieving rankings for the ISPH Mini CS50x competition.' } }, apis: ['./controllers/*.js'] })))"
```

## Key Features and Considerations

- **Error Handling:** Includes basic error handling for database interactions and missing request parameters.
- **Answer Validation:** Answers are compared case-insensitively, and extra whitespace is trimmed before comparison.
- **Time Handling:** Uses `moment` library for time calculations, including converting timestamps to GMT+7 for the ranking display.
- **Async/Await:** Uses `async/await` for cleaner asynchronous code.
- **Express Async Handler:** Uses `express-async-handler` to simplify error handling in async route handlers.
- **CORS:** CORS is enabled for all origins (`"*"`) by default. **Change this to a specific origin in a production environment.**
- **Team Progress:** The `teams_progress` table efficiently stores whether a team has solved each question using a boolean array.
- **Logging:** All the submissions are being stored on `submissions` table, with correct answer or not.
- **Vercel Deployment:** The `vercel.json` configuration enables serverless deployment on Vercel.
