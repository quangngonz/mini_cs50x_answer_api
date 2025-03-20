import supabase from "../services/supabaseService.js";

/**
 * @swagger
 * /update-team-name:
 *   post:
 *     summary: Update a team's name.
 *     description: Updates the name of a team in the database using the provided team_name_id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_name_id
 *               - team_name
 *             properties:
 *               team_name_id:
 *                 type: string
 *                 description: The unique ID of the team.
 *                 example: "Team 1"
 *               team_name:
 *                 type: string
 *                 description: The new name of the team.
 *                 example: "New Team Name"
 *     responses:
 *       200:
 *         description: Team name updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team name updated successfully"
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database update failed"
 */
const updateTeamName = async (req, res) => {
  const { team_name_id, team_name } = req.body;

  if (!team_name_id || !team_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('team_info')
    .update({ team_name })
    .eq('team_name_id', team_name_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Team name updated successfully' });
}

export default updateTeamName;
