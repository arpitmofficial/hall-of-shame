import { useEffect, useState } from 'react';
import { getMatches, createMatch, updateMatch, getStats, getUsers, deleteMatch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const EMPTY_FORM = { player1: '', player2: '', p1g: '', p2g: '', notes: '' };

export default function FIFA() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('matches');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // match being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = () =>
    Promise.all([getMatches(), getStats(), getUsers()])
      .then(([m, s, u]) => { setMatches(m.data.data); setStats(s.data.data); setUsers(u.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setErr(''); setShowModal(true); };

  const openEdit = (m) => {
    setEditTarget(m);
    setForm({
      player1: m.player1?._id || '',
      player2: m.player2?._id || '',
      p1g: String(m.score.player1Goals),
      p2g: String(m.score.player2Goals),
      notes: m.notes || '',
    });
    setErr('');
    setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!editTarget && form.player1 === form.player2) return setErr('Players must be different!');
    setSaving(true);
    try {
      if (editTarget) {
        const res = await updateMatch(editTarget._id, {
          score: { player1Goals: Number(form.p1g), player2Goals: Number(form.p2g) },
          notes: form.notes,
        });
        setMatches(matches.map((m) => m._id === editTarget._id ? res.data.data : m));
        toast('Match updated!');
      } else {
        await createMatch({
          player1: form.player1,
          player2: form.player2,
          score: { player1Goals: Number(form.p1g), player2Goals: Number(form.p2g) },
          notes: form.notes,
        });
        toast('Match logged! ⚽');
        load();
      }
      setShowModal(false);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to save match');
      toast(e.response?.data?.error || 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this match? Stats will update.')) return;
    try {
      await deleteMatch(id);
      setMatches(matches.filter((m) => m._id !== id));
      // reload stats since they changed
      getStats().then((s) => setStats(s.data.data));
      toast('Match deleted');
    } catch {
      toast('Failed to delete match', 'error');
    }
  };

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /></div></div>;

  const sorted = [...stats].sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div className="page-title">⚽ FIFA Arena</div>
          <p className="page-sub">Log matches. See who's actually the problem.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Log Match</button>
      </div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {sorted.map((s, i) => (
          <div key={s.userId} className="stat-box">
            <div className="stat-label">{i === 0 ? '👑 ' : '😬 '}{s.name}</div>
            <div className="stat-value">{s.winRate}%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              {s.wins}W · {s.draws}D · {s.losses}L · {s.goalsFor} goals
            </div>
          </div>
        ))}
        {stats.length > 0 && (
          <div className="stat-box">
            <div className="stat-label">Total Matches</div>
            <div className="stat-value">{matches.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              {stats.reduce((a, s) => a + s.goalsFor, 0)} total goals
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'matches' ? 'active' : ''}`} onClick={() => setTab('matches')}>All Matches</button>
        <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Stats Table</button>
      </div>

      {/* Matches list */}
      {tab === 'matches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {matches.length === 0 && <div className="empty"><div className="empty-icon">🎮</div><p>No matches yet. Kick off!</p></div>}
          {matches.map((m) => {
            const p1win = m.result === 'player1_win';
            const p2win = m.result === 'player2_win';
            const draw = m.result === 'draw';
            return (
              <div key={m._id} className="match-card">
                <div>
                  <div className="match-player" style={{ color: p1win ? 'var(--win)' : p2win ? 'var(--loss)' : 'var(--draw)' }}>{m.player1?.name}</div>
                  <div className="match-meta">{fmt(m.playedAt)}</div>
                </div>
                <div>
                  <div className="match-score">{m.score.player1Goals} – {m.score.player2Goals}</div>
                  <div style={{ textAlign: 'center' }}>
                    <span className={`pill ${draw ? 'pill-draw' : p1win ? 'pill-win' : 'pill-loss'}`}>{draw ? 'DRAW' : p1win ? 'P1 WIN' : 'P2 WIN'}</span>
                  </div>
                </div>
                <div className="match-player-right">
                  <div className="match-player" style={{ color: p2win ? 'var(--win)' : p1win ? 'var(--loss)' : 'var(--draw)' }}>{m.player2?.name}</div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.25rem', alignItems: 'center' }}>
                    {m.notes && <span className="match-meta" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notes}</span>}
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)} title="Edit score">✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => del(m._id)} title="Delete">🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'stats' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', textAlign: 'left' }}>
                {['#', 'Player', 'MP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Win%'].map(h => <th key={h} style={{ padding: '0.6rem 1rem' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.userId} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{i === 0 ? '👑 ' : '😬 '}{s.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{s.matches}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--win)', fontWeight: 600 }}>{s.wins}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--draw)' }}>{s.draws}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--loss)', fontWeight: 600 }}>{s.losses}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{s.goalsFor}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{s.goalsAgainst}</td>
                  <td style={{ padding: '0.75rem 1rem', color: s.goalDiff >= 0 ? 'var(--win)' : 'var(--loss)' }}>{s.goalDiff > 0 ? '+' : ''}{s.goalDiff}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{s.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editTarget ? '✏️ Edit Match' : 'Log a Match ⚽'}</div>
            {editTarget && (
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '-0.5rem' }}>
                Editing: <strong>{editTarget.player1?.name}</strong> vs <strong>{editTarget.player2?.name}</strong> — only score & notes can be changed.
              </p>
            )}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!editTarget && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Player 1</label>
                    <select className="form-select" name="player1" value={form.player1} onChange={handle} required>
                      <option value="">Select player</option>
                      {users.filter(u => u.role === 'bro').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Player 2</label>
                    <select className="form-select" name="player2" value={form.player2} onChange={handle} required>
                      <option value="">Select player</option>
                      {users.filter(u => u.role === 'bro').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{editTarget ? editTarget.player1?.name : 'P1'} Goals</label>
                  <input className="form-input" type="number" name="p1g" value={form.p1g} onChange={handle} min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">{editTarget ? editTarget.player2?.name : 'P2'} Goals</label>
                  <input className="form-input" type="number" name="p2g" value={form.p2g} onChange={handle} min="0" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" name="notes" value={form.notes} onChange={handle} placeholder="e.g. Lag, extra time, disputed..." />
              </div>
              {err && <p style={{ color: 'var(--loss)', fontSize: '0.85rem' }}>{err}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Log Match'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
