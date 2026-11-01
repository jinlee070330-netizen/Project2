import axios from "axios";

// All calls to API-Football go through here, so the API key never
// reaches the browser.
const client = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  timeout: 15000,
});

async function get(path, params) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_KEY is missing. Add it to server/.env");

  const { data } = await client.get(path, {
    params,
    headers: { "x-apisports-key": key },
  });

  // API-Football returns HTTP 200 even for errors like a bad key, an
  // exhausted daily quota or a season your plan can't access. The
  // details are in `errors`, which is an array or an object.
  const errors = data.errors;
  const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0;
  if (hasErrors) {
    const message = Object.values(errors).join(" ");
    const err = new Error(`API-Football: ${message}`);
    err.status = 502;
    throw err;
  }

  return data.response;
}

export function getTeamsForLeague(leagueId, season) {
  return get("/teams", { league: leagueId, season });
}

export function getHeadToHead(teamId1, teamId2) {
  return get("/fixtures/headtohead", { h2h: `${teamId1}-${teamId2}` });
}
