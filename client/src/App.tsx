import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import MatchupPage from "./pages/MatchupPage";
import SavedPage from "./pages/SavedPage";

export default function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="wordmark">
            Head to Head
          </Link>
          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" end>
              Compare
            </NavLink>
            <NavLink to="/saved">Saved</NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/matchup/:team1/:team2" element={<MatchupPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="page">
      <p className="notice">That page doesn’t exist.</p>
      <Link className="btn btn-quiet" to="/">Go to Compare</Link>
    </div>
  );
}
