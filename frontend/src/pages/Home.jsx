import { useEffect, useState } from 'react';
import { getStats, getMatches } from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getMatches()])
      .then(([s, m]) => { setStats(s.data.data); setMatches(m.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /></div></div>;

  const sorted = [...stats].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
  const loser = sorted[sorted.length - 1];
  const recent = matches.slice(0, 5);

  return (
    <div className="page">
      <div className="page-title">🏆 The Shame Board</div>
      <p className="page-sub">Real stats. No excuses. No lag defence.</p>

      {loser && (
        <div className="shame-banner">
          <div className="shame-banner-icon">😬</div>
          <div className="shame-banner-text">
            <div className="shame-banner-title">Current Hall of Shame Resident</div>
            <div className="shame-banner-sub">{loser.name} — {loser.wins}W / {loser.losses}L / {loser.draws}D · Win rate: {loser.winRate}%</div>
          </div>
          <div style={{ fontSize: '2rem' }}>🪑</div>
        </div>
      )}

      {/* FIFA Leaderboard */}
      <div className="section-header">
        <span className="section-title">⚽ FIFA Rankings</span>
        <a href="/fifa" style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'none' }}>View all →</a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {sorted.length === 0 && <div className="empty"><div className="empty-icon">⚽</div><p>No matches yet. Boot up FIFA!</p></div>}
        {sorted.map((s, i) => (
          <div key={s.userId} className="lb-row">
            <div className={`lb-rank lb-rank-${i + 1}`}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="lb-name">{s.name} {s.userId === user?._id ? <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>(you)</span> : ''}</div>
              <div className="lb-sub">{s.matches} matches · {s.goalsFor} goals scored · GD {s.goalDiff > 0 ? '+' : ''}{s.goalDiff}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', textAlign: 'center' }}>
              <div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--win)' }}>{s.wins}</div><div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>W</div></div>
              <div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--draw)' }}>{s.draws}</div><div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>D</div></div>
              <div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--loss)' }}>{s.losses}</div><div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>L</div></div>
            </div>
            <div style={{ width: '60px', textAlign: 'right', fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{s.winRate}%</div>
          </div>
        ))}
      </div>

      {/* Recent matches */}
      <div className="section-header">
        <span className="section-title">🕹️ Recent Matches</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {recent.length === 0 && <div className="empty"><div className="empty-icon">🎮</div><p>No matches logged yet.</p></div>}
        {recent.map((m) => {
          const res = m.result === 'draw' ? 'DRAW' : m.result === 'player1_win' ? `${m.player1?.name} wins` : `${m.player2?.name} wins`;
          return (
            <div key={m._id} className="match-card">
              <div>
                <div className="match-player">{m.player1?.name}</div>
                <div className="match-meta">{fmt(m.playedAt)}</div>
              </div>
              <div>
                <div className="match-score">{m.score.player1Goals} – {m.score.player2Goals}</div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>{res}</div>
              </div>
              <div className="match-player-right">
                <div className="match-player">{m.player2?.name}</div>
                <div className="match-meta" style={{ textAlign: 'right' }}>{m.notes || ''}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
