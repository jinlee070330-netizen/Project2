import mongoose from "mongoose";

// One document per pair of teams. `key` is the two team IDs sorted
// ascending ("529-541"), so A vs B and B vs A share the same entry.
const matchSchema = new mongoose.Schema(
  {
    fixtureId: Number,
    date: Date,
    competition: String,
    competitionLogo: String,
    round: String,
    season: Number,
    venue: String,
    homeId: Number,
    awayId: Number,
    homeGoals: Number,
    awayGoals: Number,
    penaltyHome: Number,
    penaltyAway: Number,
    status: String,
  },
  { _id: false }
);

const h2hCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  matches: [matchSchema],
  fetchedAt: { type: Date, default: Date.now },
});

export const H2HCache = mongoose.model("H2HCache", h2hCacheSchema);
