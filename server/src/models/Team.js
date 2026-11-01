import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  apiId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  logo: String,
  country: String,
  leagueId: { type: Number, required: true, index: true },
  leagueName: String,
});

export const Team = mongoose.model("Team", teamSchema);
