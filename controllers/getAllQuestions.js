import supabase from "../services/supabaseService.js";

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
