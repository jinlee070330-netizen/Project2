import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { checkSaved, deleteSaved, errorMessage, getHeadToHead, saveMatchup } from "../api";
import Crest from "../components/Crest";
import { computeStats, resultOf, type BiggestWin, type Result } from "../stats";
import type { H2HResponse, Match, Team } from "../types";

const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function MatchupPage() {
  const params = useParams();
  const team1Id = Number(params.team1);
  const team2Id = Number(params.team2);

  const [data, setData] = useState<H2HResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [competition, setCompetition] = useState("all");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    setCompetition("all");

    Promise.all([getHeadToHead(team1Id, team2Id), checkSaved(team1Id, team2Id)])
      .then(([h2h, saved]) => {
        if (ignore) return;
        setData(h2h);
        setSavedId(saved.id);
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
  }, [team1Id, team2Id]);

  const stats = useMemo(() => (data ? computeStats(data.matches, team1Id) : null), [data, team1Id]);

  const shownMatches = useMemo(() => {
    if (!data) return [];
    return competition === "all" ? data.matches : data.matches.filter((m) => m.competition === competition);
  }, [data, competition]);

  async function toggleSaved() {
    setSaving(true);
    try {
      if (savedId) {
        await deleteSaved(savedId);
        setSavedId(null);
      } else {
        const saved = await saveMatchup(team1Id, team2Id);
        setSavedId(saved._id);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><p className="notice">Loading head-to-head…</p></div>;

  if (error || !data || !stats) {
    return (
      <div className="page">
        <p className="notice notice-error">{error ?? "No data for this matchup."}</p>
        <Link className="btn btn-quiet" to="/">Pick different teams</Link>
      </div>
    );
  }

  const { team1, team2 } = data;
  const nameOf = (r: Result) => (r === "team1" ? team1.name : r === "team2" ? team2.name : "Draw");

  return (
    <div className="page matchup">
      <section className="scoreboard" aria-label="Overall record">
        <TeamHeading team={team1} side="team1" />
        <div className="record">
          <div className="record-numbers">
            <span className="num num-team1">{stats.team1Wins}</span>
            <span className="num num-draw">{stats.draws}</span>
            <span className="num num-team2">{stats.team2Wins}</span>
          </div>
          <div className="record-keys">
            <span>Wins</span>
            <span>Draws</span>
            <span>Wins</span>
          </div>
        </div>
        <TeamHeading team={team2} side="team2" />
      </section>

      {stats.played > 0 && (
        <div className="split-bar" role="img" aria-label={`${team1.name} ${stats.team1Wins} wins, ${stats.draws} draws, ${team2.name} ${stats.team2Wins} wins`}>
          <span className="seg seg-team1" style={{ flexGrow: stats.team1Wins }} />
          <span className="seg seg-draw" style={{ flexGrow: stats.draws }} />
          <span className="seg seg-team2" style={{ flexGrow: stats.team2Wins }} />
        </div>
      )}

      <div className="matchup-actions">
        <button type="button" className="btn btn-primary" onClick={toggleSaved} disabled={saving}>
          {savedId ? "Remove from saved" : "Save matchup"}
        </button>
        <Link className="btn btn-quiet" to="/">Compare other teams</Link>
        <span className="hint">
          {data.fromCache ? "From your saved data" : "Just fetched from API-Football"}, updated{" "}
          {dateFormat.format(new Date(data.fetchedAt))}
        </span>
      </div>

      {stats.played === 0 ? (
        <p className="notice">
          No finished matches between {team1.name} and {team2.name} in the seasons your API plan covers.
        </p>
      ) : (
        <>
          <section className="facts" aria-label="Key numbers">
            <Fact label="Matches played" value={String(stats.played)} />
            <Fact label="Goals" value={`${stats.team1Goals} – ${stats.team2Goals}`} detail={`${team1.name} – ${team2.name}`} />
            <Fact
              label="Current run"
              value={stats.streak ? `${stats.streak.count} ${stats.streak.result === "draw" ? (stats.streak.count === 1 ? "draw" : "draws") : stats.streak.count === 1 ? "win" : "wins"}` : "–"}
              detail={stats.streak ? (stats.streak.result === "draw" ? "In a row" : `${nameOf(stats.streak.result)} in a row`) : undefined}
            />
            <Fact label="Last five">
              <span className="form">
                {stats.recent.map((r, i) => (
                  <span key={i} className={`form-dot form-${r}`} title={nameOf(r)}>
                    {r === "draw" ? "D" : r === "team1" ? team1.name.charAt(0) : team2.name.charAt(0)}
                  </span>
                ))}
              </span>
            </Fact>
          </section>

          <section className="biggest" aria-label="Biggest wins">
            <BiggestCard title={`${team1.name}’s biggest win`} win={stats.team1Biggest} team1={team1} team2={team2} side="team1" />
            <BiggestCard title={`${team2.name}’s biggest win`} win={stats.team2Biggest} team1={team1} team2={team2} side="team2" />
          </section>

          <section>
            <h2 className="section-title">By competition</h2>
            <div className="table-wrap">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th scope="col">Competition</th>
                    <th scope="col">Played</th>
                    <th scope="col" className="col-team1">{team1.name}</th>
                    <th scope="col">Draws</th>
                    <th scope="col" className="col-team2">{team2.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byCompetition.map((c) => (
                    <tr key={c.competition}>
                      <th scope="row">
                        <span className="comp-name">
                          <Crest src={c.logo} name={c.competition} size={20} />
                          {c.competition}
                        </span>
                      </th>
                      <td>{c.played}</td>
                      <td className="col-team1">{c.team1Wins}</td>
                      <td>{c.draws}</td>
                      <td className="col-team2">{c.team2Wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2 className="section-title">Every meeting</h2>
              <label className="field field-inline">
                <span>Competition</span>
                <select value={competition} onChange={(e) => setCompetition(e.target.value)}>
                  <option value="all">All competitions</option>
                  {stats.byCompetition.map((c) => (
                    <option key={c.competition} value={c.competition}>{c.competition}</option>
                  ))}
                </select>
              </label>
            </div>
            <ol className="match-list">
              {shownMatches.map((m) => (
                <MatchRow key={m.fixtureId} match={m} team1={team1} team2={team2} />
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}

function TeamHeading({ team, side }: { team: Team; side: "team1" | "team2" }) {
  return (
    <div className={`team-heading team-heading-${side}`}>
      <Crest src={team.logo} name={team.name} size={72} />
      <h1>{team.name}</h1>
      <p>{team.leagueName}</p>
    </div>
  );
}

function Fact({ label, value, detail, children }: { label: string; value?: string; detail?: string; children?: ReactNode }) {
  return (
    <div className="fact">
      <p className="fact-label">{label}</p>
      {children ?? <p className="fact-value">{value}</p>}
      {detail && <p className="fact-detail">{detail}</p>}
    </div>
  );
}

function BiggestCard({ title, win, team1, team2, side }: { title: string; win: BiggestWin | null; team1: Team; team2: Team; side: "team1" | "team2" }) {
  return (
    <div className={`biggest-card biggest-${side}`}>
      <h3>{title}</h3>
      {win ? (
        <>
          <p className="biggest-score">{scoreLine(win.match, team1, team2)}</p>
          <p className="fact-detail">
            {win.match.competition}, {dateFormat.format(new Date(win.match.date))}
          </p>
        </>
      ) : (
        <p className="fact-detail">No wins in this record.</p>
      )}
    </div>
  );
}

function scoreLine(match: Match, team1: Team, team2: Team) {
  const home = match.homeId === team1.apiId ? team1 : team2;
  const away = home === team1 ? team2 : team1;
  return `${home.name} ${match.homeGoals}–${match.awayGoals} ${away.name}`;
}

function MatchRow({ match, team1, team2 }: { match: Match; team1: Team; team2: Team }) {
  const home = match.homeId === team1.apiId ? team1 : team2;
  const away = home === team1 ? team2 : team1;
  const result = resultOf(match, team1.apiId);
  const winnerId = result === "team1" ? team1.apiId : result === "team2" ? team2.apiId : null;
  const hasPens = match.penaltyHome !== null && match.penaltyAway !== null;

  return (
    <li className={`match-row result-${result}`}>
      <div className="match-meta">
        <span>{dateFormat.format(new Date(match.date))}</span>
        <span className="match-comp">
          <Crest src={match.competitionLogo} name={match.competition} size={16} />
          {match.competition}
        </span>
        {match.round && <span className="match-round">{match.round}</span>}
      </div>
      <div className="match-line">
        <span className={`match-team home ${winnerId === home.apiId ? "won" : ""}`}>
          {home.name}
          <Crest src={home.logo} name={home.name} size={24} />
        </span>
        <span className="match-score" aria-label={`${match.homeGoals} to ${match.awayGoals}`}>
          {match.homeGoals}–{match.awayGoals}
        </span>
        <span className={`match-team away ${winnerId === away.apiId ? "won" : ""}`}>
          <Crest src={away.logo} name={away.name} size={24} />
          {away.name}
        </span>
      </div>
      {hasPens && (
        <p className="match-note">
          {match.penaltyHome}–{match.penaltyAway} on penalties
        </p>
      )}
      {match.venue && <p className="match-note">{match.venue}</p>}
    </li>
  );
}
