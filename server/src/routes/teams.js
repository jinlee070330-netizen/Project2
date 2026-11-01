import { Router } from "express";
import { Team } from "../models/Team.js";
import { LEAGUES } from "../leagues.js";

const router = Router();

// GET /api/teams/leagues -> the leagues the app supports
router.get("/leagues", (req, res) => {
  res.json(LEAGUES);
});

// GET /api/teams?league=39 -> every team in that league, from our database
// GET /api/teams?search=arsenal -> teams whose name matches
router.get("/", async (req, res) => {
  const { league, search } = req.query;
  const filter = {};
  if (league) filter.leagueId = Number(league);
  if (search) filter.name = { $regex: escapeRegex(String(search)), $options: "i" };

  const teams = await Team.find(filter).sort({ name: 1 }).lean();
  res.json(teams);
});

// GET /api/teams/:apiId -> one team
router.get("/:apiId", async (req, res) => {
  const team = await Team.findOne({ apiId: Number(req.params.apiId) }).lean();
  if (!team) return res.status(404).json({ error: "Team not found" });
  res.json(team);
});

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default router;
