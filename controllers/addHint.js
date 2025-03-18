import supabase from "../services/supabaseService.js";
import moment from "moment";

/**
 * @swagger
 * /addHint:
 *   post:
 *     summary: Add a hint for a team and question
 *     description: Stores a hint submission with a timestamp in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamNameId
 *               - team_name_id
 *             properties:
 *               team_name_id:
 *                 type: string
 *                 description: The name of the team submitting the hint
 *                 example: "Team 1"
 *               question_id:
 *                 type: integer
 *                 description: The ID of the question
 *                 example: 3
 *     responses:
 *       201:
 *         description: Hint added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hint added successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
const addHint = async (req, res) => {
  const { team_name_id, question_id } = req.body;

  if (!team_name_id || !question_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const hintTime = moment().utcOffset("+0700").format("YYYY-MM-DD HH:mm:ss");

  try {
    const { data, error } = await supabase
      .from("hints_given")
      .insert([
        {
          team_name_id,
          question_id,
          submitted_at: hintTime,
        },
      ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Hint added successfully",
      data: { team_name_id, question_id, submitted_at: hintTime },
    });
  } catch (err) {
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export default addHint;
