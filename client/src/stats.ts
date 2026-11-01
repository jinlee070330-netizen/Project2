import type { Match } from "./types";

export type Result = "team1" | "team2" | "draw";

export interface BiggestWin {
  match: Match;
  margin: number;
}

export interface CompetitionRecord {
  competition: string;
  logo: string;
  played: number;
  team1Wins: number;
  draws: number;
  team2Wins: number;
}

export interface H2HStats {
  played: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  team1Goals: number;
  team2Goals: number;
  team1Biggest: BiggestWin | null;
  team2Biggest: BiggestWin | null;
  byCompetition: CompetitionRecord[];
  streak: { result: Result; count: number } | null;
  recent: Result[];
}

// Goals scored by each side in one match, from team1's point of view.
export function goalsFor(match: Match, team1Id: number) {
  const team1Home = match.homeId === team1Id;
  return {
    team1: team1Home ? match.homeGoals : match.awayGoals,
    team2: team1Home ? match.awayGoals : match.homeGoals,
  };
}

// A match settled on penalties counts as a draw, as in official records.
export function resultOf(match: Match, team1Id: number): Result {
  const g = goalsFor(match, team1Id);
  if (g.team1 > g.team2) return "team1";
  if (g.team2 > g.team1) return "team2";
  return "draw";
}

// `matches` must be sorted newest first (the server does this).
export function computeStats(matches: Match[], team1Id: number): H2HStats {
  const stats: H2HStats = {
    played: matches.length,
    team1Wins: 0,
    team2Wins: 0,
    draws: 0,
    team1Goals: 0,
    team2Goals: 0,
    team1Biggest: null,
    team2Biggest: null,
    byCompetition: [],
    streak: null,
    recent: [],
  };
  const competitions = new Map<string, CompetitionRecord>();

  for (const match of matches) {
    const g = goalsFor(match, team1Id);
    const result = resultOf(match, team1Id);
    const margin = Math.abs(g.team1 - g.team2);

    stats.team1Goals += g.team1;
    stats.team2Goals += g.team2;

    let comp = competitions.get(match.competition);
    if (!comp) {
      comp = { competition: match.competition, logo: match.competitionLogo, played: 0, team1Wins: 0, draws: 0, team2Wins: 0 };
      competitions.set(match.competition, comp);
    }
    comp.played++;

    if (result === "team1") {
      stats.team1Wins++;
      comp.team1Wins++;
      if (!stats.team1Biggest || margin > stats.team1Biggest.margin) stats.team1Biggest = { match, margin };
    } else if (result === "team2") {
      stats.team2Wins++;
      comp.team2Wins++;
      if (!stats.team2Biggest || margin > stats.team2Biggest.margin) stats.team2Biggest = { match, margin };
    } else {
      stats.draws++;
      comp.draws++;
    }
  }

  stats.byCompetition = [...competitions.values()].sort((a, b) => b.played - a.played);
  stats.recent = matches.slice(0, 5).map((m) => resultOf(m, team1Id));

  if (matches.length) {
    const first = resultOf(matches[0], team1Id);
    let count = 0;
    for (const m of matches) {
      if (resultOf(m, team1Id) !== first) break;
      count++;
    }
    stats.streak = { result: first, count };
  }

  return stats;
}
