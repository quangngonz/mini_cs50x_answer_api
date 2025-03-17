import supabase from "../services/supabaseService.js";
import moment from "moment";

const teams = [
  { team_name_id: "Team 1", solves: [false, false, false, false, false], timestamps: [] },
  { team_name_id: "Team 2", solves: [false, false, false, false, false], timestamps: [] },
  { team_name_id: "Team 3", solves: [false, false, false, false, false], timestamps: [] },
  { team_name_id: "Team 4", solves: [false, false, false, false, false], timestamps: [] },
  { team_name_id: "Team 5", solves: [false, false, false, false, false], timestamps: [] },
  { team_name_id: "Team 6", solves: [false, false, false, false, false], timestamps: [] },
  { team_name_id: "Team 7", solves: [false, false, false, false, false], timestamps: [] },
  { team_name_id: "Team 8", solves: [false, false, false, false, false], timestamps: [] }
];

async function pushTeamsData() {
  for (const team of teams) {
    team.solves = [false, false, false, false, false];
    // team.timestamps = [
    //   new Date().toISOString(),
    //   new Date().toISOString(),
    //   new Date().toISOString(),
    //   new Date().toISOString(),
    //   new Date().toISOString()
    // ];

    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    team.timestamps = [null, null, null,  null , null]


    const { error } = await supabase.from('teams_progress').insert([team]);
    if (error) {
      console.error(`Error inserting data for ${team.team_name_id}:`, error);
    } else {
      console.log(`Inserted data for ${team.team_name_id}`);
    }
  }
}

pushTeamsData().then(() => process.exit(0)).catch(() => process.exit(1));
