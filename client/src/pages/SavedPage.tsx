import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteSaved, errorMessage, getSaved } from "../api";
import Crest from "../components/Crest";
import type { SavedMatchup } from "../types";

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedMatchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSaved()
      .then(setSaved)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    try {
      await deleteSaved(id);
      setSaved((current) => current.filter((s) => s._id !== id));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="page">
      <header className="page-intro">
        <h1>Saved matchups</h1>
        <p>Rivalries you’ve saved, ready to reopen.</p>
      </header>

      {error && <p className="notice notice-error">{error}</p>}
      {loading && <p className="notice">Loading saved matchups…</p>}

      {!loading && !error && saved.length === 0 && (
        <div className="empty">
          <p>You haven’t saved a matchup yet. Open any head-to-head and choose Save matchup.</p>
          <Link className="btn btn-primary" to="/">Compare two teams</Link>
        </div>
      )}

      <ul className="saved-list">
        {saved.map((s) => (
          <li key={s._id} className="saved-item">
            <Link className="saved-link" to={`/matchup/${s.team1.apiId}/${s.team2.apiId}`}>
              <span className="saved-team">
                <Crest src={s.team1.logo} name={s.team1.name} size={36} />
                {s.team1.name}
              </span>
              <span className="saved-vs">vs</span>
              <span className="saved-team">
                <Crest src={s.team2.logo} name={s.team2.name} size={36} />
                {s.team2.name}
              </span>
            </Link>
            <button type="button" className="btn btn-quiet" onClick={() => remove(s._id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
