// Run once: npm run load-teams
// Uses one API call per league (5 total) and stores every team in MongoDB,
// so team search never touches your daily API quota.
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import { Team } from "../models/Team.js";
import { LEAGUES } from "../leagues.js";
import { getTeamsForLeague } from "../apiFootball.js";

const season = Number(process.env.SEASON) || 2024;

await connectDB();

for (const league of LEAGUES) {
  try {
    const results = await getTeamsForLeague(league.id, season);
    const ops = results.map(({ team }) => ({
      updateOne: {
        filter: { apiId: team.id },
        update: {
          apiId: team.id,
          name: team.name,
          logo: team.logo,
          country: team.country,
          leagueId: league.id,
          leagueName: league.name,
        },
        upsert: true,
      },
    }));
    if (ops.length) await Team.bulkWrite(ops);
    console.log(`${league.name}: saved ${ops.length} teams`);
  } catch (err) {
    console.error(`${league.name}: ${err.message}`);
  }
}

console.log(`Done. ${await Team.countDocuments()} teams in the database.`);
await mongoose.disconnect();
