import axios from "axios";
import type { H2HResponse, League, SavedMatchup, Team } from "./types";

// Every request goes to our own Express server, never straight to
// API-Football, so the API key stays on the server.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
});

export async function getLeagues() {
  const { data } = await api.get<League[]>("/teams/leagues");
  return data;
}

export async function getTeams(leagueId: number) {
  const { data } = await api.get<Team[]>("/teams", { params: { league: leagueId } });
  return data;
}

export async function getHeadToHead(team1: number, team2: number) {
  const { data } = await api.get<H2HResponse>("/h2h", { params: { team1, team2 } });
  return data;
}

export async function getSaved() {
  const { data } = await api.get<SavedMatchup[]>("/saved");
  return data;
}

export async function checkSaved(team1: number, team2: number) {
  const { data } = await api.get<{ saved: boolean; id: string | null }>("/saved/check", {
    params: { team1, team2 },
  });
  return data;
}

export async function saveMatchup(team1Id: number, team2Id: number) {
  const { data } = await api.post<SavedMatchup>("/saved", { team1Id, team2Id });
  return data;
}

export async function deleteSaved(id: string) {
  await api.delete(`/saved/${id}`);
}

export function errorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Can't reach the server. Check that it's running on port 4000.";
    return err.response.data?.error ?? `Request failed (${err.response.status})`;
  }
  return "Something went wrong.";
}
