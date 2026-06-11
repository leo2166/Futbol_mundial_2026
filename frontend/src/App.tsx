import { useState, useEffect } from 'react'
import './App.css'
import './index.css'

interface Team {
  name: string;
}

interface Match {
  id: string;
  match_date: string;
  stadium: string;
  home_score: number;
  away_score: number;
  status: string;
  home_team: Team;
  away_team: Team;
}

const API_BASE_URL = 'https://futbol-mundial-2026.onrender.com';

function App() {
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [yesterdayMatches, setYesterdayMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayRes, yesterdayRes, upcomingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matches/today`),
        fetch(`${API_BASE_URL}/matches/finished`),
        fetch(`${API_BASE_URL}/matches`)
      ]);

      if (!todayRes.ok || !yesterdayRes.ok || !upcomingRes.ok) {
        throw new Error('Error al conectar con el servidor de datos');
      }

      const todayData = await todayRes.json();
      const yesterdayData = await yesterdayRes.json();
      const allData = await upcomingRes.json();

      setTodayMatches(todayData);
      setYesterdayMatches(yesterdayData);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = allData.filter((m: Match) => 
        m.match_date.startsWith(todayStr) === false && m.status === 'SCHEDULED'
      );
      setUpcomingMatches(upcoming);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="app-container">
      <header className="main-header">
        <h1 className="main-title">CALENDARIO MUNDIAL 2026</h1>
        <div className="ball-icon">⚽</div>
      </header>
      
      <div className="dashboard-layout">
        <div className="top-section">
          <div className="section-card">
            <div className="section-header">PARTIDOS DE HOY</div>
            <div className="match-list">
              {todayMatches.length > 0 ? (
                todayMatches.map(m => (
                  <div key={m.id} className="match-row">
                    <div className="team-info">
                      <span className="flag">🇪🇸</span> 
                      <span className="team-name">{m.home_team.name}</span>
                    </div>
                    <div className="match-center">
                      <span className="match-time">{m.match_date.split('T')[1].substring(0, 5)}</span>
                    </div>
                    <div className="team-info" style={{ justifyContent: 'flex-end' }}>
                      <span className="team-name">{m.away_team.name}</span>
                      <span className="flag">🇧🇷</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-msg">No hay juegos previstos para hoy.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bottom-section">
          <div className="section-card">
            <div className="section-header">RESULTADOS DE AYER</div>
            <div className="match-list">
              {yesterdayMatches.length > 0 ? (
                yesterdayMatches.map(m => (
                  <div key={m.id} className="match-row">
                    <div className="team-info">
                      <span className="flag">🇩🇪</span>
                      <span className="team-name">{m.home_team.name}</span>
                    </div>
                    <div className="match-center">
                      <span className="match-score">{m.home_score} - {m.away_score}</span>
                    </div>
                    <div className="team-info" style={{ justifyContent: 'flex-end' }}>
                      <span className="team-name">{m.away_team.name}</span>
                      <span className="flag">🇯🇵</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-msg">No hay resultados recientes.</p>
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">PRÓXIMOS PARTIDOS</div>
            <div className="match-list">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map(m => (
                  <div key={m.id} className="match-row">
                    <div className="team-info">
                      <span className="flag">🇵🇹</span>
                      <span className="team-name">{m.home_team.name}</span>
                    </div>
                    <div className="match-center">
                      <span className="match-date">{m.match_date.split('T')[0]}</span>
                    </div>
                    <div className="team-info" style={{ justifyContent: 'flex-end' }}>
                      <span className="team-name">{m.away_team.name}</span>
                      <span className="flag">🇲🇽</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-msg">No hay próximos encuentros.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="trophy-container">
        <div className="trophy-icon">🏆</div>
      </div>

      {loading && <div className="sync-indicator">Sincronizando...</div>}
      {error && <div className="error-indicator">{error}</div>}
    </div>
  )
}

export default App
