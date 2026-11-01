import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage, getLeagues } from "../api";
import TeamPicker from "../components/TeamPicker";
import type { League, Team } from "../types";

export default function SearchPage() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeagues()
      .then(setLeagues)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const ready = team1 && team2 && team1.apiId !== team2.apiId;

  return (
    <div className="page">
      <header className="page-intro">
        <h1>Who wins when they meet?</h1>
        <p>Pick two clubs from Europe’s top five leagues to see how their meetings have gone.</p>
      </header>

      {error && <p className="notice notice-error">{error}</p>}

      <div className="pickers">
        <TeamPicker
          side="team1"
          label="First team"
          leagues={leagues}
          selected={team1}
          disabledTeamId={team2?.apiId}
          onSelect={setTeam1}
        />
        <div className="vs" aria-hidden="true">
          vs
        </div>
        <TeamPicker
          side="team2"
          label="Second team"
          leagues={leagues}
          selected={team2}
          disabledTeamId={team1?.apiId}
          onSelect={setTeam2}
        />
      </div>

      <div className="compare-bar">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!ready}
          onClick={() => ready && navigate(`/matchup/${team1.apiId}/${team2.apiId}`)}
        >
          Show head-to-head
        </button>
        {!ready && <p className="hint">Choose both teams to continue.</p>}
      </div>
    </div>
  );
}
