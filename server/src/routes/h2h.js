import { Router } from "express";
import { Team } from "../models/Team.js";
import { H2HCache } from "../models/H2HCache.js";
import { getHeadToHead } from "../apiFootball.js";
import { pairKey } from "../pairKey.js";

const router = Router();

// Cached results are reused for 24 hours before we ask API-Football again.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FINISHED = new Set(["FT", "AET", "PEN"]);

// GET /api/h2h?team1=541&team2=529
router.get("/", async (req, res) => {
  const team1Id = Number(req.query.team1);
  const team2Id = Number(req.query.team2);

  if (!team1Id || !team2Id) {
    return res.status(400).json({ error: "Pass two team IDs: ?team1=...&team2=..." });
  }
  if (team1Id === team2Id) {
    return res.status(400).json({ error: "Pick two different teams" });
  }

  const [team1, team2] = await Promise.all([
    Team.findOne({ apiId: team1Id }).lean(),
    Team.findOne({ apiId: team2Id }).lean(),
  ]);
  if (!team1 || !team2) {
    return res.status(404).json({ error: "One of those teams isn't in the database. Run npm run load-teams." });
  }

  const key = pairKey(team1Id, team2Id);
  let cached = await H2HCache.findOne({ key }).lean();
  const isFresh = cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS;
  let fromCache = true;

  // Only spend an API call when we have nothing stored, or it's stale.
  if (!isFresh) {
    const fixtures = await getHeadToHead(team1Id, team2Id);
    const matches = fixtures
      .filter((f) => FINISHED.has(f.fixture.status.short))
      .map(simplifyFixture)
      .sort((a, b) => b.date - a.date);

    cached = await H2HCache.findOneAndUpdate(
      { key },
      { key, matches, fetchedAt: new Date() },
      { upsert: true, returnDocument: "after" }
    ).lean();
    fromCache = false;
  }

  res.json({
    team1,
    team2,
    matches: cached.matches,
    fetchedAt: cached.fetchedAt,
    fromCache,
  });
});

// Keep only the fields the app uses, so the cache stays small.
function simplifyFixture(f) {
  return {
    fixtureId: f.fixture.id,
    date: new Date(f.fixture.date),
    competition: f.league.name,
    competitionLogo: f.league.logo,
    round: f.league.round,
    season: f.league.season,
    venue: f.fixture.venue?.name ?? null,
    homeId: f.teams.home.id,
    awayId: f.teams.away.id,
    homeGoals: f.goals.home,
    awayGoals: f.goals.away,
    penaltyHome: f.score?.penalty?.home ?? null,
    penaltyAway: f.score?.penalty?.away ?? null,
    status: f.fixture.status.short,
  };
}

export default router;
