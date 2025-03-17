import supabase from "../services/supabaseService.js";

// Question data to be inserted
const questions = [
  { id: 1, question: "What is 2 + 2?", answer: "4" },
  { id: 2, question: "What is the capital of France?", answer: "Paris" },
  { id: 3, question: "What is 5 * 6?", answer: "30" },
  { id: 4, question: "Who wrote Hamlet?", answer: "Shakespeare" },
  { id: 5, question: "What is the boiling point of water in Celsius?", answer: "100" }
];

// Function to insert or update questions in the database
async function seedQuestions() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .upsert(questions, { onConflict: "id" });

    if (error) {
      console.error("❌ Error inserting questions:", error);
      process.exit(1);
    }

    console.log("✅ Questions successfully inserted:");
    console.table(data);

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

// Run the function and exit the process accordingly
seedQuestions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
