import supabase from "../services/supabaseService.js";
import moment from "moment";

const teams = [
  { team_name_id: "Team 1" },
  { team_name_id: "Team 2" },
  { team_name_id: "Team 3" },
  { team_name_id: "Team 4" },
  { team_name_id: "Team 5" },
  { team_name_id: "Team 6" },
  { team_name_id: "Team 7" },
  { team_name_id: "Team 8" }
];

async function updateTeamsData() {
  for (const team of teams) {
    // Generate random boolean values
    const solves = Array.from({ length: 5 }, () => Math.random() < 0.5);

    // Generate timestamps only if the corresponding solve is true
    const timestamps = solves.map(solve => solve ? moment().subtract(Math.floor(Math.random() * 180), 'minutes').format('YYYY-MM-DD HH:mm:ss') : null);

    const { error } = await supabase
      .from('teams_progress')
      .update({ solves, timestamps })
      .eq('team_name_id', team.team_name_id);

    if (error) {
      console.error(`Error updating data for ${team.team_name_id}:`, error);
    } else {
      console.log(`Updated data for ${team.team_name_id}`);
    }
  }
}

async function blankTeamsData() {
  for (const team of teams) {
    const solves = Array.from({ length: 5 }, () => false);
    const timestamps = Array.from({ length: 5 }, () => null);

    const { error } = await supabase
      .from('teams_progress')
      .update({ solves, timestamps })
      .eq('team_name_id', team.team_name_id);

    if (error) {
      console.error(`Error updating data for ${team.team_name_id}:`, error);
    } else {
      console.log(`Updated data for ${team.team_name_id}`);
    }
  }
}

updateTeamsData().then(() => process.exit(0)).catch(() => process.exit(1));
// blankTeamsData().then(() => process.exit(0)).catch(() => process.exit(1));