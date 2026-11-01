import { useEffect, useState } from "react";
import { errorMessage, getTeams } from "../api";
import type { League, Team } from "../types";
import Crest from "./Crest";

interface TeamPickerProps {
  side: "team1" | "team2";
  label: string;
  leagues: League[];
  selected: Team | null;
  disabledTeamId?: number;
  onSelect: (team: Team | null) => void;
}

export default function TeamPicker({ side, label, leagues, selected, disabledTeamId, onSelect }: TeamPickerProps) {
  const [leagueId, setLeagueId] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to the first league once the list arrives.
  useEffect(() => {
    if (leagueId === null && leagues.length) setLeagueId(leagues[0].id);
  }, [leagues, leagueId]);

  // Load that league's teams from our server whenever the league changes.
  useEffect(() => {
    if (leagueId === null) return;
    let ignore = false;
    setLoading(true);
    setError(null);
    getTeams(leagueId)
      .then((data) => {
        if (!ignore) setTeams(data);
      })
      .catch((err) => {
        if (!ignore) setError(errorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [leagueId]);

  const visible = teams.filter((t) => t.name.toLowerCase().includes(filter.trim().toLowerCase()));

  if (selected) {
    return (
      <section className={`picker picker-${side} picker-chosen`}>
        <h2 className="picker-label">{label}</h2>
        <div className="chosen">
          <Crest src={selected.logo} name={selected.name} size={88} />
          <p className="chosen-name">{selected.name}</p>
          <p className="chosen-league">{selected.leagueName}</p>
          <button type="button" className="btn btn-quiet" onClick={() => onSelect(null)}>
            Change team
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`picker picker-${side}`}>
      <h2 className="picker-label">{label}</h2>

      <div className="picker-controls">
        <label className="field">
          <span>League</span>
          <select value={leagueId ?? ""} onChange={(e) => setLeagueId(Number(e.target.value))}>
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Find a team</span>
          <input
            type="search"
            value={filter}
            placeholder="Type a name"
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="notice notice-error">{error}</p>}
      {loading && <p className="notice">Loading teams…</p>}
      {!loading && !error && teams.length === 0 && (
        <p className="notice">No teams stored for this league yet. Run npm run load-teams in the server folder.</p>
      )}
      {!loading && teams.length > 0 && visible.length === 0 && <p className="notice">No team matches “{filter}”.</p>}

      <ul className="team-grid">
        {visible.map((team) => (
          <li key={team.apiId}>
            <button
              type="button"
              className="team-option"
              disabled={team.apiId === disabledTeamId}
              onClick={() => onSelect(team)}
            >
              <Crest src={team.logo} name={team.name} size={36} />
              <span>{team.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
