export interface League {
  id: number;
  name: string;
  country: string;
}

export interface Team {
  _id: string;
  apiId: number;
  name: string;
  logo: string;
  country: string;
  leagueId: number;
  leagueName: string;
}

export interface Match {
  fixtureId: number;
  date: string;
  competition: string;
  competitionLogo: string;
  round: string;
  season: number;
  venue: string | null;
  homeId: number;
  awayId: number;
  homeGoals: number;
  awayGoals: number;
  penaltyHome: number | null;
  penaltyAway: number | null;
  status: string;
}

export interface H2HResponse {
  team1: Team;
  team2: Team;
  matches: Match[];
  fetchedAt: string;
  fromCache: boolean;
}

export interface SavedTeam {
  apiId: number;
  name: string;
  logo: string;
}

export interface SavedMatchup {
  _id: string;
  key: string;
  team1: SavedTeam;
  team2: SavedTeam;
  createdAt: string;
}
