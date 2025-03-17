import supabase from "../services/supabaseService.js";

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     description: Retrieves a list of all questions without their answers.
 *     responses:
 *       200:
 *         description: A list of questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The question ID.
 *                   question:
 *                     type: string
 *                     description: The question text.
 *                   star_rating:
 *                     type: integer
 *                     description: The star rating of the question.
 *       500:
 *         description: Internal Server Error.
 */
const getAllQuestions = async (req, res) => {
  try {
    // Fetch questions from Supabase
    const { data, error } = await supabase
      .from("questions")
      .select("id, question, star_rating");

    if (error) {
      console.error("❌ Supabase Error:", error);
      return res.status(500).json({ error: "Failed to fetch questions from database" });
    }

    // Sort questions by id
    data.sort((a, b) => a.id - b.id);

    res.json(data);
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default getAllQuestions;
