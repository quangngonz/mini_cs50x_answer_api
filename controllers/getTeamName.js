import supabase from "../services/supabaseService.js";

/**
 * @swagger
 * /get-team-name:
 *   post:
 *     summary: Retrieve the team name ID for a given email.
 *     description: Fetches the team_name_id from the 'team_info' table based on the provided email. Requires authentication.
 *     tags:
 *       - Requires Auth
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "leader@example.com"
 *     responses:
 *       200:
 *         description: Successfully retrieved the team name ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team_name_id:
 *                   type: string
 *                   example: "team123"
 *       400:
 *         description: Bad request. Email is missing.
 *       403:
 *         description: Unauthorized. User is not allowed to access this resource.
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Server error.
 */
const getTeamName = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if the authenticated user matches the requested email
    if (req.user.email !== email) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('team_info') // Change this to your actual table
      .select('team_name_id')
      .eq('leader_email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team_name_id: data.team_name_id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export default getTeamName;
