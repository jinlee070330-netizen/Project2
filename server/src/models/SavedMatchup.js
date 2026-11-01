import mongoose from "mongoose";

const savedMatchupSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  team1: { apiId: Number, name: String, logo: String },
  team2: { apiId: Number, name: String, logo: String },
  createdAt: { type: Date, default: Date.now },
});

export const SavedMatchup = mongoose.model("SavedMatchup", savedMatchupSchema);
