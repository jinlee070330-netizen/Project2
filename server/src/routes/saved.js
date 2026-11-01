import { Router } from "express";
import { Team } from "../models/Team.js";
import { SavedMatchup } from "../models/SavedMatchup.js";
import { pairKey } from "../pairKey.js";

const router = Router();

// GET /api/saved -> all saved matchups, newest first
router.get("/", async (req, res) => {
  const saved = await SavedMatchup.find().sort({ createdAt: -1 }).lean();
  res.json(saved);
});

// GET /api/saved/check?team1=541&team2=529 -> { saved: true/false, id }
router.get("/check", async (req, res) => {
  const key = pairKey(req.query.team1, req.query.team2);
  const existing = await SavedMatchup.findOne({ key }).lean();
  res.json({ saved: Boolean(existing), id: existing?._id ?? null });
});

// POST /api/saved  body: { team1Id, team2Id }
router.post("/", async (req, res) => {
  const team1Id = Number(req.body?.team1Id);
  const team2Id = Number(req.body?.team2Id);
  if (!team1Id || !team2Id || team1Id === team2Id) {
    return res.status(400).json({ error: "Send two different team IDs" });
  }

  const key = pairKey(team1Id, team2Id);
  const existing = await SavedMatchup.findOne({ key }).lean();
  if (existing) return res.json(existing);

  const [team1, team2] = await Promise.all([
    Team.findOne({ apiId: team1Id }).lean(),
    Team.findOne({ apiId: team2Id }).lean(),
  ]);
  if (!team1 || !team2) return res.status(404).json({ error: "Team not found" });

  const saved = await SavedMatchup.create({
    key,
    team1: { apiId: team1.apiId, name: team1.name, logo: team1.logo },
    team2: { apiId: team2.apiId, name: team2.name, logo: team2.logo },
  });
  res.status(201).json(saved);
});

// DELETE /api/saved/:id
router.delete("/:id", async (req, res) => {
  const deleted = await SavedMatchup.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Saved matchup not found" });
  res.status(204).end();
});

export default router;
