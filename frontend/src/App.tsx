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

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'live' | 'finished'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      const data = await response.json();
      setMatches(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const endpointMap = {
      all: '/matches',
      today: '/matches/today',
      live: '/matches/live',
      finished: '/matches/finished',
    };
    fetchMatches(endpointMap[filter]);
  }, [filter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="app-wrapper">
      <header className="hero-header">
        <div className="container">
          <h1>Mundial 2026</h1>
          <p>La experiencia definitiva del fútbol mundial</p>
        </div>
      </header>

      <main className="container">
        <nav className="filter-nav">
          <button 
            className={`nav-item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos los Encuentros
          </button>
          <button 
            className={`nav-item ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            📅 Partidos de Hoy
          </button>
          <button 
            className={`nav-item ${filter === 'live' ? 'active' : ''}`}
            onClick={() => setFilter('live')}
          >
            🔴 En Vivo Ahora
          </button>
          <button 
            className={`nav-item ${filter === 'finished' ? 'active' : ''}`}
            onClick={() => setFilter('finished')}
          >
            🏆 Resultados Finales
          </button>
        </nav>

        {loading && (
          <div style={{ textAlign: 'center', fontSize: '1.5rem', marginTop: '3rem', color: 'var(--color-accent)' }}>
            Sincronizando con la FIFA...
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: 'center', color: '#ff4d4d', margin: '3rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', borderRadius: '12px' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <div className="match-grid">
            {matches.length > 0 ? (
              matches.map((match) => (
                <div key={match.id} className="match-card">
                  <div className="match-meta">
                    <span>{formatDate(match.match_date)}</span>
                    {match.status === 'LIVE' && (
                      <span className="live-badge">EN VIVO</span>
                    )}
                  </div>
                  
                  <div className="match-core">
                    <div className="team-box">
                      <span className="team-name">{match.home_team.name}</span>
                    </div>
                    
                    <div className="score-board">
                      {match.status === 'SCHEDULED' ? (
                        <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>VS</span>
                      ) : (
                        <>
                          <span>{match.home_score}</span>
                          <span style={{ opacity: 0.3 }}>:</span>
                          <span>{match.away_score}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="team-box">
                      <span className="team-name">{match.away_team.name}</span>
                    </div>
                  </div>

                  <div className="match-info">
                    📍 {match.stadium}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚽</div>
                <p>No hay encuentros disponibles en esta categoría.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
