import supabase from '../services/supabaseService.js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

function createTeams(N) {
  return Array.from({ length: N }, (_, i) => ({
    team_name_id: `Team ${i + 1}`,
    solves: Array(5).fill(false),
    timestamps: Array(5).fill(null),
  }));
}

const teams = createTeams(14);
console.log(teams);

const insertTeams = async () => {
  teams.forEach(async (team) => {
    const { error } = await supabase.from('teams_progress').insert([team]);
    if (error) {
      console.error(`Error inserting data for ${team.team_name_id}:`, error);
    } else {
      console.log(`Inserted data for ${team.team_name_id}`);
    }
  });
};

insertTeams();

const team_info_template = {
  leader_email: '',
  team_name: null,
  team_name_id: '',
  team_members: [],
};

const emails = [
  'wonjoon.l.student@isph.edu.vn',
  'minh.h.student@isph.edu.vn',
  'Michelle.p.student@isph.edu.vn',
  'duckien.l.student@isph.edu.vn',
  'ngoclinh.d.student@isph.edu.vn',
  'jaein.l.student@isph.edu.vn',
  'seunga.l.student@isph.edu.vn',
  'Haianh.t.student@isph.edu.vn',
  'inseong.h.student@isph.edu.vn',
  'shinji.p.student@isph.edu.vn',
  'linh.v.student@isph.edu.vn',
  'harrison.r.student@isph.edu.vn',
  'an.db.student@isph.edu.vn',
];

const team_info = emails.map((email) => {
  const team = { ...team_info_template };
  team.leader_email = email;
  team.team_name = null;
  team.team_name_id = `Team ${emails.indexOf(email) + 1}`;
  team.team_members = [];
  return team;
});

console.log(team_info);

const insertTeamInfo = async () => {
  team_info.forEach(async (team) => {
    const { error } = await supabase.from('team_info').insert([team]);
    if (error) {
      console.error(`Error inserting data for ${team.team_name_id}:`, error);
    } else {
      console.log(`Inserted data for ${team.team_name_id}`);
    }
  });
};

insertTeamInfo();
