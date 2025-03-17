import supabase from "../services/supabaseService.js";

/**
 * @swagger
 * /team/{team_name_id}/questions:
 *   get:
 *     summary: Get team questions
 *     description: Retrieves the solve status and timestamps of a specific team.
 *     parameters:
 *       - in: path
 *         name: team_name_id
 *         required: true
 *         description: The ID of the team.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 solves:
 *                   type: array
 *                   description: An array containing solve status.
 *                   items:
 *                     type: boolean
 *                 timestamps:
 *                   type: array
 *                   description: An array containing timestamps of solves.
 *                   items:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Internal Server Error.
 */
const getTeamQuestions = async (req, res) => {
  try {
    const { team_name_id } = req.params;

    // Fetch questions teams from Supabase
    const { data, error } = await supabase
      .from("teams_progress")
      .select("solves, timestamps")
      .eq("team_name_id", team_name_id);

    if (error) {
      console.error("❌ Supabase Error:", error);
      return res.status(500).json({ error: "Failed to fetch team questions from database" });
    }

    if (!data.length) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(data[0]);
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default getTeamQuestions;
