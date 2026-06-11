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
      // Ejecutamos las 3 peticiones en paralelo para máxima velocidad
      const [todayRes, yesterdayRes, upcomingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matches/today`),
        fetch(`${API_BASE_URL}/matches/finished`), // Usamos finished para ayer
        fetch(`${API_BASE_URL}/matches`) // Usamos all para filtrar los próximos
      ]);

      if (!todayRes.ok || !yesterdayRes.ok || !upcomingRes.ok) {
        throw new Error('Error al conectar con el servidor de datos');
      }

      const todayData = await todayRes.json();
      const yesterdayData = await yesterdayRes.json();
      const allData = await upcomingRes.json();

      setTodayMatches(todayData);
      setYesterdayMatches(yesterdayData);
      
      // Filtramos los próximos partidos (estos que no son de hoy y no están finalizados)
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = allData.filter(m => 
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

  const getFlagUrl = (teamName: string) => {
    // Usamos la API de flagsapi.com para obtener banderas reales basadas en nombres
    // Nota: En producción, tendríamos un mapeo de nombres a códigos de país (ISO 3166-1)
    return `https://flagsapi.com/${teamName.toUpperCase()}/flat/64.png`; 
    // Esto es una simplificación; para banderas reales se requiere el código de país (ej. ES, AR, BR)
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Calendario Mundial 2026</h1>
      
      <div className="dashboard-grid">
        {/* SECCIÓN: PARTIDOS DE HOY */}
        <div className="section-card">
          <div className="section-header">Partidos de Hoy</div>
          <div className="match-list">
            {todayMatches.length > 0 ? (
              todayMatches.map(m => (
                <div key={m.id} className="match-row">
                  <div className="team-info">
                    <span className="team-name">{m.home_team.name}</span>
                  </div>
                  <div className="match-center">
                    <span className="match-time">{m.match_date.split('T')[1].substring(0, 5)}</span>
                  </div>
                  <div className="team-info" style={{ justifyContent: 'flex-end' }}>
                    <span className="team-name">{m.away_//team.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay juegos previstos para hoy.</p>
            )}
          </div>
        </div>

        {/* SECCIÓN: RESULTADOS DE AYER */}
        <div className="section-card">
          <div className="section-header" style={{ color: 'var(--color-accent)' }}>Resultados de Ayer</div>
          <div className="match-list">
            {yesterdayMatches.length > 0 ? (
              yesterdayMatches.map(m => (
                <div key={m.id} className="match-row">
                  <div className="team-info">
                    <span className="team-name">{m.home_team.name}</span>
                  </div>
                  <div className="match-center">
                    <span className="match-score">{m.home_score} - {m.away_score}</span>
                  </div>
                  <div className="team-info" style={{ justifyContent: 'flex-end' }}>
                    <span className="team-name">{m.away_team.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay resultados recientes.</p>
            )}
          </div>
        </div>

        {/* SECCIÓN: PRÓXIMOS PARTIDOS */}
        <div className="section-card">
          <div className="section-header" style={{ color: 'var(--color-text-muted)' }}>Próximos Partidos</div>
          <div className="match-list">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map(m => (
                <div key={m.id} className="match-row">
                  <div className="team-info">
                    <span className="team-name">{m.home_team.name}</span>
                  </div>
                  <div className="match-center">
                    <span className="match-date">{m.match_date.split('T')[0]}</span>
                  </div>
                  <div className="team-info" style={{ justifyContent: 'flex-end' }}>
                    <span className="//team-name">{m.away_team.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay próximos encuentros programados.</p>
            )}
          </div>
        </div>
      </div>

      {loading && <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--color-accent)', color: 'black', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold' }}>Sincronizando...</div>}
      {error && <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'red', color: 'white', padding: '10px 20px', borderRadius: '50px' }}>{error}</div>}
    </div>
  )
}

export default App
