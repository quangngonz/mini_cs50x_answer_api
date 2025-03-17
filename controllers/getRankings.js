import supabase from "../services/supabaseService.js";
import moment from "moment";

/**
 * @swagger
 * /ranking:
 *   get:
 *     summary: Get team rankings
 *     description: Retrieves the current rankings of teams based on their scores and solve times.
 *     responses:
 *       200:
 *         description: A list of team rankings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   team_name:
 *                     type: string
 *                     description: The name of the team.
 *                   solves:
 *                     type: array
 *                     description: An array containing solve status and timestamps.
 *                     items:
 *                       type: array
 *                       items:
 *                         oneOf:  # Allow either boolean or string
 *                           - type: boolean  # Solved or not
 *                           - type: string   # Timestamp, or null if not solved.
 *                             format: date-time
 *
 *                   score:
 *                     type: integer
 *                     description: The team's score.
 *                   latestSolve:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp of the team's latest solve (GMT+7).
 *       500:
 *         description: Internal Server Error.
 */
export default async function getRankings(req, res) {
  let ranking = [];

  const { data: teams, error } = await supabase
    .from("teams_progress")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get question id and star
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, star_rating");

  if (questionsError) {
    return res.status(500).json({ error: questionsError.message });
  }

  // Sort questions by id
  questions.sort((a, b) => a.id - b.id);
  let questions_star = []
  questions.forEach((question) => {
    if (question.star_rating) {
      questions_star.push(question.star_rating);
    }
  });

  console.log(`Questions star: ${questions_star}`);

  // Calculate score for each team
  teams.forEach((team) => {
    let score = 0;
    let team_name = team.team_name_id;
    let answeredQuestions = team.solves;

    let timestamps = team.timestamps;
    const latestTimestamp = team.timestamps
      .filter(ts => ts !== null) // Remove null values
      .map(ts => moment(ts)) // Convert to moment objects
      .reduce((max, curr) => curr.isAfter(max) ? curr : max, moment(0)) // Find the max

    for (let i = 0; i < answeredQuestions.length; i++) {
      if (answeredQuestions[i]) {
        score += questions_star[i];
      }
    }

    console.log(team_name, answeredQuestions, score, latestTimestamp);

    ranking.push({
      team_name,
      solves: [answeredQuestions, timestamps],
      score,
      latestSolve: latestTimestamp,
    })
  });

  // Sort ranking by score, then by fastest time
  ranking.sort((a, b) => {
    if (a.score === b.score) {
      return a.latestTimestamp - b.latestTimestamp;
    }
    return b.score - a.score;
  });

  res.json(ranking);
}
