import supabase from '../services/supabaseService.js';
import moment from 'moment';

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
    .from('teams_progress')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get question id and star
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, star_rating');

  if (questionsError) {
    return res.status(500).json({ error: questionsError.message });
  }

  // Sort questions by id
  questions.sort((a, b) => a.id - b.id);
  let questions_star = [];
  questions.forEach((question) => {
    if (question.star_rating !== null) {
      questions_star.push(question.star_rating);
    }
  });

  console.log(`Questions star: ${questions_star}`);

  // Get all submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('*')
    .eq('correct', false);

  if (submissionsError) {
    return res.status(500).json({ error: submissionsError.message });
  }

  const teamsSubmissions = {};

  // Count how many wrong answers each team has submitted
  submissions.forEach((submission) => {
    if (!submission.correct) {
      if (!teamsSubmissions[submission.team_name_id]) {
        teamsSubmissions[submission.team_name_id] = [];
      }
      teamsSubmissions[submission.team_name_id].push(submission);
    }
  });

  // Get all hints given
  const { data: hints, error: hintsError } = await supabase
    .from('hints_given')
    .select('*');

  if (hintsError) {
    return res.status(500).json({ error: hintsError.message });
  }

  // Count how many hints each team has given
  const teamsHints = {};
  hints.forEach((hint) => {
    if (!teamsHints[hint.team_name_id]) {
      teamsHints[hint.team_name_id] = 0;
    }
    teamsHints[hint.team_name_id]++;
  });

  console.log(teamsHints);

  // Calculate score for each team
  for (const team of teams) {
    let score = 0;
    let team_name = team.team_name_id;
    let answeredQuestions = team.solves;

    let timestamps = team.timestamps;
    const latestTimestamp = team.timestamps
      .filter((ts) => ts !== null) // Remove null values
      .map((ts) => moment(ts)) // Convert to moment objects
      .reduce((max, curr) => (curr.isAfter(max) ? curr : max), moment(0)); // Find the max

    for (let i = 0; i < answeredQuestions.length; i++) {
      if (answeredQuestions[i]) {
        score += questions_star[i];
      }
    }

    const hints_given = teamsHints[team_name] ? teamsHints[team_name] : 0;

    // Get team_name_string from team_info table
    const { data: teamInfo, error: teamInfoError } = await supabase
      .from('team_info')
      .select('team_name')
      .eq('team_name_id', team_name);

    if (teamInfoError) {
      res.status(500).json({error: teamInfoError.message});
    }

    const team_name_string = teamInfo[0].team_name || team_name;

    console.log(
      team_name,
      answeredQuestions,
      score,
      hints_given,
      latestTimestamp,
      teamInfo[0].team_name
    );

    ranking.push({
      team_name,
      team_name_string: team_name_string,
      solves: [answeredQuestions, timestamps],
      score,
      hints_given: teamsHints[team_name] ? teamsHints[team_name] : 0,
      wrong_answers: teamsSubmissions[team_name]
        ? teamsSubmissions[team_name].length
        : 0,
      latestSolve: latestTimestamp,
    });
  }

  // Sort ranking by score, then hints_given, wrong_answers given then by fastest time
  ranking.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score; // Higher score first
    if (a.hints_given !== b.hints_given) return a.hints_given - b.hints_given; // Fewer hints first
    if (a.wrong_answers !== b.wrong_answers)
      return a.wrong_answers - b.wrong_answers; // Fewer wrong answers first
    return a.latestSolve - b.latestSolve; // Earlier solve time first
  });

  res.json(ranking);
}
