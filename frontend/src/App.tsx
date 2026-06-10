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
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'live' | 'finished'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
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
    if (selectedDate) {
      fetchMatches(`/date/${selectedDate}`);
    } else {
      const endpointMap = {
        all: '/matches',
        today: '/matches/today',
        live: '/matches/live',
        finished: '/matches/finished',
      };
      fetchMatches(endpointMap[filter]);
    }
  }, [filter, selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const clearDate = () => {
    setSelectedDate('');
  };

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
        <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          <nav className="filter-nav">
            <button 
              className={`nav-item ${filter === 'all' && !selectedDate ? 'active' : ''}`}
              onClick={() => { setFilter('all'); setSelectedDate(''); }}
            >
              Todos los Encuentros
            </button>
            <button 
              className={`nav-item ${filter === 'today' && !selectedDate ? 'active' : ''}`}
              onClick={() => { setFilter('today'); setSelectedDate(''); }}
            >
              📅 Partidos de Hoy
            </button>
            <button 
              className={`nav-item ${filter === 'live' && !selectedDate ? 'active' : ''}`}
              onClick={() => { setFilter('live'); setSelectedDate(''); }}
            >
              🔴 En Vivo Ahora
            </button>
            <button 
              className={`nav-item ${filter === 'finished' && !selectedDate ? 'active' : ''}`}
              onClick={() => { setFilter('finished'); setSelectedDate(''); }}
            >
              🏆 Resultados Finales
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-card)', padding: '1rem 2rem', borderRadius: '50px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>📅 Filtrar por día:</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={handleDateChange}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontFamily: 'inherit', 
                cursor: 'pointer',
                outline: 'none' 
              }} 
            />
            {selectedDate && (
              <button 
                onClick={clearDate}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

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
                  <div className="match-header">
                    <span>{formatDate(match.match_date)}</span>
                    {match.status === 'LIVE' && (
                      <span className="live-indicator">● EN VIVO</span>
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
                <p>
                  {selectedDate 
                    ? `No hay partidos programados para el ${selectedDate}.` 
                    : filter === 'today' 
                      ? 'Para hoy no hay juegos previstos. ¡Vuelve mañana!' 
                      : filter === 'live' 
                        ? 'No hay partidos en vivo en este momento. ¡Sigue atento!' 
                        : 'No hay encuentros disponibles en esta categoría.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
