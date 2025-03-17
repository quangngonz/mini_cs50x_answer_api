import supabase from "../services/supabaseService.js";

/**
 * @swagger
 * /team/{team_name_id}/stats:
 *   get:
 *     summary: Retrieve team statistics including solves, score, and hints given.
 *     description: Fetches the team's progress, calculates their score based on the star ratings of solved questions, and returns relevant statistics.
 *     parameters:
 *       - in: path
 *         name: team_name_id
 *         required: true
 *         description: The unique identifier for the team.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved team statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team_name:
 *                   type: string
 *                   description: The ID of the team.
 *                 solves:
 *                   type: array
 *                   items:
 *                     type: array
 *                     description: An array containing solved question IDs and timestamps.
 *                 score:
 *                   type: integer
 *                   description: The total score based on solved questions and their star ratings.
 *                 hints_given:
 *                   type: integer
 *                   description: The number of hints given to the team.
 *       404:
 *         description: Team not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Team not found
 *       500:
 *         description: Internal Server Error or database fetch error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch team stats from database
 */
const getTeamStats = async (req, res) => {
  try {
    const { team_name_id } = req.params;

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

    // Fetch team stats from Supabase
    const { data, error } = await supabase
      .from("teams_progress")
      .select("solves, timestamps, hints_given")
      .eq("team_name_id", team_name_id);

    if (error) {
      console.error("❌ Supabase Error:", error);
      return res.status(500).json({ error: "Failed to fetch team stats from database" });
    }

    if (!data.length) {
      return res.status(404).json({ error: "Team not found" });
    }

    let score = 0;
    let team_name = team_name_id;
    let answeredQuestions = data[0].solves;
    let hints_given = data[0].hints_given;

    for(let i = 0; i < answeredQuestions.length; i++) {
      if (answeredQuestions[i]) {
        score += questions_star[i];
      }
    }

    let response = {
      team_name,
      solves: [answeredQuestions, data[0].timestamps],
      score,
      hints_given
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default getTeamStats;
