import expressAsyncHandler from "express-async-handler";
import supabase from "../services/supabaseService.js";
import moment from "moment";

// Middleware to validate request body
const validateRequest = (req, res, next) => {
  const { team_name_id, question_id, answer } = req.body;
  if (!team_name_id || !question_id || !answer) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  next();
};

// Fetch question answer
const getQuestionAnswer = async (question_id) => {
  const { data, error } = await supabase
    .from("questions")
    .select("answer")
    .eq("id", question_id)
    .single(); // Expecting one row

  if (error || !data) throw new Error("Question not found");
  return data.answer.trim().toUpperCase();
};

// Fetch team progress
const getTeamProgress = async (team_name_id) => {
  const { data, error } = await supabase
    .from("teams_progress")
    .select("solves, timestamps")
    .eq("team_name_id", team_name_id)
    .single();

  if (error || !data) throw new Error("Team not found");
  return data;
};

// Log submission
const logSubmission = async (team_name_id, question_id, answer, correct) => {
  const { error } = await supabase.from("submissions").insert([
    {
      team_name_id,
      question_id,
      answer,
      submitted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      correct,
    },
  ]);

  if (error) console.error("Error inserting submission:", error);
};

// Mark team as successful solver
const setSuccessfulSolver = async (team_name_id, question_id, teamData) => {
  const solveTime = moment().format("YYYY-MM-DD HH:mm:ss");
  let { solves = [], timestamps = [] } = teamData;

  if (solves[question_id - 1]) {
    console.log("Team has already solved this question");
    return { success: false, message: "Team has already solved this question" };
  }

  solves[question_id - 1] = true;
  timestamps[question_id - 1] = solveTime;

  const { error } = await supabase
    .from("teams_progress")
    .update({ solves, timestamps })
    .eq("team_name_id", team_name_id);

  if (error) {
    console.error("Error updating team progress:", error);
    return { success: false, message: "Failed to update team progress" };
  }

  return { success: true };
};

// Main route handler
const submitAnswer = expressAsyncHandler(async (req, res) => {
  const { team_name_id, question_id, answer } = req.body;

  const [correctAnswer, teamData] = await Promise.all([
    getQuestionAnswer(question_id),
    getTeamProgress(team_name_id),
  ]);

  console.log(
    `Team ${team_name_id} answered question ${question_id} with "${answer}"`
  );

  const submittedAnswer = answer.trim().toUpperCase();
  const isCorrect =
    submittedAnswer.replace(/\s/g, "") === correctAnswer.replace(/\s/g, "");

  console.log(
    `Correct: ${'*'.repeat(correctAnswer.length)}, Submitted: ${submittedAnswer}, Match: ${isCorrect}`
  );

  if (isCorrect) {
    console.log("Correct answer!");
    await setSuccessfulSolver(team_name_id, question_id, teamData);
  } else {
    console.log("Incorrect answer!");
  }

  await logSubmission(team_name_id, question_id, answer, isCorrect);
  res.json({ correct: isCorrect });
});

// Export with validation middleware
export default [validateRequest, submitAnswer];
