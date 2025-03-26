# Mini CS50x Answer API

This API provides endpoints for submission to ISPH Mini CS50x Puzzle Day, allowing users to submit answers to questions, retrieve questions, view team rankings, submit hints, and manage team information. It's built with Node.js, Express, and Supabase.

## Directory Structure

```plaintext
quangngonz-mini_cs50x_answer_api/
├── README.md           # This file
├── controllers/        # Request handlers
│   ├── addHint.js           # Add a hint request
│   ├── getAllQuestions.js   # Get all questions (without answers)
│   ├── getRankings.js       # Get team rankings
│   ├── getTeamName.js      # Get team name and ID by leader's email (requires authentication)
│   ├── getTeamQuestions.js # Get a team's solve status and timestamps
│   ├── getTeamStats.js     # Get team statistics (solves, score, hints)
│   ├── submitAnswer.js     # Submit an answer and check correctness
│   └── updateTeamName.js    # Update a team's name
├── index.js            # Main application file
├── middleware/         # Middleware functions
│   └── authenticate.js     # Authentication middleware
├── package-lock.json   # npm lock file
├── package.json        # Node.js dependencies and scripts
├── public/             # Static files for Swagger UI
│   ├── swagger.html    # Swagger UI HTML page
│   └── swagger.json    # Swagger API specification (auto-generated)
├── services/
│   └── supabaseService.js # Supabase client setup
├── utils/              # Utility scripts
│   ├── pushQuestions.js  # (Example) Script to seed questions
│   ├── pushTeams.js      # (Example) Script to seed team progress
│   └── randomTeamResults.js # (Example) Script to simulate team progress.
└── vercel.json          # Vercel deployment configuration
```

## Endpoints

All endpoints are relative to the base URL (e.g., if your API is deployed at `https://example.com`, the `/questions` endpoint is accessed at `https://example.com/questions`).

- **GET `/questions`**: Retrieves all questions, including their `id`, `question` text, and `star_rating`. Answers are _not_ included. Questions are sorted by ID.

    - **Response:**
      ```json
      [
        { "id": 1, "question": "What is 2 + 2?", "star_rating": 1 },
        { "id": 2, "question": "What is the capital of France?", "star_rating": 2 },
        ...
      ]
      ```

- **GET `/ranking`**: Retrieves the current team rankings. Rankings are sorted first by score (sum of question star ratings for solved questions), then by the number of hints given, then by the number of wrong answers given, and finally by the timestamp of the latest correct submission.

    - **Response:**
      ```json
      [
        {
          "team_name": "Team A",
          "solves": [
            [true, false, true, ...], // Boolean array: true if solved, false otherwise
            ["2024-07-24 10:00:00", null, "2024-07-24 11:30:00", ...] // Timestamps (GMT+7) or null
          ],
          "score": 3,
          "hints_given": 0,
          "wrong_answers": 2,
          "latestSolve": "2024-07-24T04:30:00.000Z" // Latest solve timestamp (GMT+7)
        },
        ...
      ]
      ```

- **POST `/answer`**: Submits an answer for a specific question.

    - **Request Body (JSON):**

      ```json
      {
        "team_name_id": "Team 1",
        "question_id": 2,
        "answer": "paris"
      }
      ```

    - **Response:**
      ```json
      { "correct": true } // or { "correct": false }
      ```
      Logs all submissions (correct or incorrect) to a Supabase table.

- **POST `/addHint`**: Submits a hint request for a specific team and question.

    - **Request Body (JSON):**

      ```json
      {
        "team_name_id": "Team 1",
        "question_id": 3
      }
      ```

    - **Response (201 Created):**
      ```json
      {
        "message": "Hint added successfully",
        "data": {
          "team_name_id": "Team 1",
          "question_id": 3,
          "submitted_at": "2024-07-28 15:45:00"
        }
      }
      ```
    - **Response (400 Bad Request):**
      ```json
      {
        "error": "Missing required fields"
      }
      ```
    - Adds an entry to the `hints_given` table.

- **POST `/get-team-name`**: Retrieves the `team_name_id` and `team_name` associated with a leader's email. _Requires Authentication._

    - **Request Body (JSON):**
      ```json
      {
        "email": "leader@example.com"
      }
      ```
    - **Request Headers:**
      ```
      Authorization: Bearer <your_supabase_jwt>
      ```
    - **Response:**
      ```json
      {
        "team_name_id": "Team123",
        "team_name": "My Team"
      }
      ```
    - **Response (400, 401, 403, 404, 500):** Returns appropriate error messages for invalid requests, unauthorized access, or server errors.

- **POST `/update-team-name`**: Updates the name of a team.

    - **Request Body (JSON):**
      ```json
      {
        "team_name_id": "Team123",
        "team_name": "New Team Name"
      }
      ```
    - **Response (200 OK):**
      ```json
      {
        "message": "Team name updated successfully"
      }
      ```
    - **Response (400, 500):** Returns appropriate error for missing fields or database update failure.

- **GET `/team/{team_name_id}/questions`**: Retrieves the solve status (`solves`) and timestamps (`timestamps`) for a specific team.

    - **Response:**
      ```json
      {
        "solves": [true, false, true, false, false],
        "timestamps": [
          "2024-01-01 10:00:00",
          null,
          "2024-01-01 12:30:00",
          null,
          null
        ]
      }
      ```
    - **Response (404):** If the team is not found, returns a 404 error.

- **GET `/team/{team_name_id}/stats`**: Retrieves statistics for a specific team, including solves, score, and hints given.

    - **Response:**
      ```json
      {
        "team_name": "Team123",
        "solves": [
          [true, false, true, false, false],
          ["2024-01-01 10:00:00", null, "2024-01-01 12:30:00", null, null]
        ],
        "score": 3,
        "hints_given": 2
      }
      ```
    - **Response (404, 500):** Returns error responses for team not found or database errors.

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
    - `hints_given`:
        - `id` (integer, primary key, auto-increment)
        - `team_name_id` (text)
        - `question_id` (integer)
        - `submitted_at` (timestamp)
    - `team_info`
        - `team_name_id` (text, primary key)
        - `leader_email` (text)
        - `team_name` (text)

## Deployment (Vercel)

The `vercel.json` file is included for easy deployment to Vercel. Simply link your repository to a Vercel project and it should deploy automatically. Make sure to set the environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) in your Vercel project settings.

## Swagger Documentation

This API includes Swagger documentation for easy exploration and testing.

1.  **Generate `swagger.json`:**

    Due to Vercel deployment, the `swagger.json` file is dynamically generated. Run this command to generate it:

    ```bash
    npm run generate-swagger
    ```

    This command creates the `/public/swagger.json` file.

2.  **Access Swagger UI:**

    After running the server (either locally or on Vercel), access the Swagger UI at:

    - **Local Development:** `http://localhost:<PORT>/api-docs` (replace `<PORT>` with your configured port, default is 3000)
    - **Vercel Deployment:** `<your-vercel-app-url>/api-docs`

    The Swagger UI provides interactive documentation, allowing you to see all endpoints, their parameters, and make requests directly from the browser.

## Authentication

The `/get-team-name` endpoint requires authentication using a JSON Web Token (JWT) provided by Supabase.

1.  **Obtain a JWT:** You'll need to use the Supabase client library in your frontend application to authenticate a user (e.g., using email/password login). Upon successful authentication, Supabase will return a JWT.

2.  **Include the JWT in the Header:** When making requests to protected endpoints, include the JWT in the `Authorization` header:

    ```
    Authorization: Bearer <your_supabase_jwt>
    ```

    Replace `<your_supabase_jwt>` with the actual JWT.

3.  **Middleware:** The `middleware/authenticate.js` file handles JWT verification. It extracts the token, verifies it with Supabase, and if valid, attaches the user information to the `req` object (`req.user`).

## Key Features and Considerations

- **Error Handling:** Includes comprehensive error handling for database interactions, missing request parameters, and authentication failures.
- **Answer Validation:** Answers are compared case-insensitively, and extra whitespace is trimmed before comparison.
- **Time Handling:** Uses `moment` library for time calculations, including converting timestamps to GMT+7 for the ranking display.
- **Async/Await:** Uses `async/await` for cleaner asynchronous code.
- **Express Async Handler:** Uses `express-async-handler` to simplify error handling in async route handlers.
- **CORS:** CORS is enabled for all origins (`"*"`) by default. **Change this to a specific origin in a production environment.**
- **Team Progress:** The `teams_progress` table efficiently stores whether a team has solved each question using a boolean array.
- **Logging:** All the submissions are being stored on `submissions` table, with correct answer or not.
- **Hint Tracking:** The `hints_given` table tracks hint requests, and the `/addHint` endpoint allows teams to request hints.
- **Team Management:** Endpoints are included to retrieve team information (`/get-team-name`) and update team names (`/update-team-name`).
- **Swagger Documentation:** Provides a user-friendly interface to explore and test the API using Swagger UI.
- **Vercel Deployment:** The `vercel.json` configuration enables serverless deployment on Vercel.
- **Example Utility Scripts:** The `utils` folder contains example scripts (`pushQuestions.js`, `pushTeams.js`, `randomTeamResults.js`) that demonstrate how to interact with the Supabase database. These are _examples_ and can be modified or removed as needed.
