import { useEffect, useState } from 'react';
import { getLogs, reviewLog, getMatches, updateMatch, deleteMatch, getCompetitions, toggleCompetition, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Main section tabs
  const [section, setSection] = useState('claims');

  // Claims state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [claimTab, setClaimTab] = useState('pending');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(null);

  // Matches state
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [editMatch, setEditMatch] = useState(null);
  const [editForm, setEditForm] = useState({ p1g: '', p2g: '', notes: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Competitions state
  const [comps, setComps] = useState([]);
  const [compsLoading, setCompsLoading] = useState(true);

  // Council state
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [confirmMatchId, setConfirmMatchId] = useState(null); // match id awaiting delete confirm

  // Load functions
  const loadLogs = (status) => {
    setLogsLoading(true);
    getLogs({ status })
      .then((res) => setLogs(res.data.data))
      .catch(console.error)
      .finally(() => setLogsLoading(false));
  };

  const loadMatches = () => {
    setMatchesLoading(true);
    getMatches()
      .then((res) => setMatches(res.data.data))
      .catch(console.error)
      .finally(() => setMatchesLoading(false));
  };

  const loadComps = () => {
    setCompsLoading(true);
    getCompetitions()
      .then((res) => setComps(res.data.data))
      .catch(console.error)
      .finally(() => setCompsLoading(false));
  };

  const loadUsers = () => {
    setUsersLoading(true);
    getUsers()
      .then((res) => setAllUsers(res.data.data))
      .catch(console.error)
      .finally(() => setUsersLoading(false));
  };

  useEffect(() => { loadLogs(claimTab); }, [claimTab]);
  useEffect(() => { if (section === 'matches') loadMatches(); }, [section]);
  useEffect(() => { if (section === 'competitions') loadComps(); }, [section]);
  useEffect(() => { if (section === 'council') loadUsers(); }, [section]);

  // Claims actions
  const review = async (id, status) => {
    try {
      await reviewLog(id, { status, reviewNote });
      setLogs(logs.filter((l) => l._id !== id));
      setReviewing(null);
      setReviewNote('');
      toast(status === 'approved' ? '✅ Claim approved!' : '❌ Claim rejected');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed', 'error');
    }
  };

  // Match actions
  const openEditMatch = (m) => {
    setEditMatch(m);
    setEditForm({ p1g: String(m.score.player1Goals), p2g: String(m.score.player2Goals), notes: m.notes || '' });
  };

  const saveMatch = async () => {
    setEditSaving(true);
    try {
      const res = await updateMatch(editMatch._id, {
        score: { player1Goals: Number(editForm.p1g), player2Goals: Number(editForm.p2g) },
        notes: editForm.notes,
      });
      setMatches(matches.map(m => m._id === editMatch._id ? res.data.data : m));
      setEditMatch(null);
      toast('Match updated!');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed', 'error');
    } finally { setEditSaving(false); }
  };

  const delMatch = async (id) => {
    try {
      await deleteMatch(id);
      setMatches(matches.filter(m => m._id !== id));
      toast('Match deleted');
    } catch {
      toast('Failed to delete', 'error');
    } finally {
      setConfirmMatchId(null);
    }
  };

  // Competition actions
  const handleToggleComp = async (comp) => {
    try {
      const res = await toggleCompetition(comp._id);
      setComps(comps.map(c => c._id === comp._id ? { ...c, isActive: res.data.data.isActive } : c));
      toast(res.data.data.isActive ? '✅ Competition reopened' : '🔒 Competition closed');
    } catch {
      toast('Failed to toggle', 'error');
    }
  };

  const pendingCount = logs.filter(l => l.status === 'pending').length;

  return (
    <div className="page">
      <div className="page-title">👮 Council Panel</div>
      <p className="page-sub">Full admin control. With great power comes great responsibility (or abuse it).</p>

      {/* Section nav */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        <button className={`tab ${section === 'claims' ? 'active' : ''}`} onClick={() => setSection('claims')}>
          ⏳ Claims {claimTab === 'pending' && logs.length > 0 ? <span className="nav-badge">{logs.length}</span> : ''}
        </button>
        <button className={`tab ${section === 'matches' ? 'active' : ''}`} onClick={() => setSection('matches')}>⚽ Matches</button>
        <button className={`tab ${section === 'competitions' ? 'active' : ''}`} onClick={() => setSection('competitions')}>🎯 Competitions</button>
        <button className={`tab ${section === 'council' ? 'active' : ''}`} onClick={() => setSection('council')}>👥 Members</button>
      </div>

      {/* ── CLAIMS ── */}
      {section === 'claims' && (
        <>
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab ${claimTab === 'pending' ? 'active' : ''}`} onClick={() => setClaimTab('pending')}>⏳ Pending</button>
            <button className={`tab ${claimTab === 'approved' ? 'active' : ''}`} onClick={() => setClaimTab('approved')}>✅ Approved</button>
            <button className={`tab ${claimTab === 'rejected' ? 'active' : ''}`} onClick={() => setClaimTab('rejected')}>❌ Rejected</button>
          </div>

          {logsLoading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : logs.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">{claimTab === 'pending' ? '🎉' : claimTab === 'approved' ? '✅' : '🗑️'}</div>
              <p>{claimTab === 'pending' ? 'All clear! Nothing to review.' : `No ${claimTab} entries.`}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {logs.map((l) => (
                <div key={l._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ fontSize: '1.8rem' }}>{l.competition?.emoji || '🏆'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{l.user?.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{l.competition?.title} · {fmt(l.loggedAt)}</div>
                      {l.note && <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>📝 "{l.note}"</div>}
                      {l.reviewNote && (
                        <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: 'var(--muted)' }}>
                          Council: "{l.reviewNote}" — {l.reviewedBy?.name}
                        </div>
                      )}
                    </div>
                    <span className={`pill pill-${l.status}`}>{l.status}</span>
                  </div>

                  {claimTab === 'pending' && (
                    <div>
                      {reviewing === l._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input className="form-input" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Rejection reason (optional)" />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-green btn-sm" onClick={() => review(l._id, 'approved')}>✅ Approve</button>
                            <button className="btn btn-red btn-sm" onClick={() => review(l._id, 'rejected')}>❌ Reject</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setReviewing(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-green btn-sm" onClick={() => review(l._id, 'approved')}>✅ Approve</button>
                          <button className="btn btn-red btn-sm" onClick={() => { setReviewing(l._id); setReviewNote(''); }}>❌ Reject with reason</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MATCHES ── */}
      {section === 'matches' && (
        <>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <span className="section-title">All FIFA Matches</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{matches.length} total</span>
          </div>

          {matchesLoading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : matches.length === 0 ? (
            <div className="empty"><div className="empty-icon">⚽</div><p>No matches yet.</p></div>
          ) : editMatch ? (
            <div className="card" style={{ maxWidth: '440px' }}>
              <div style={{ fontWeight: 700, marginBottom: '1rem' }}>
                ✏️ Editing: {editMatch.player1?.name} vs {editMatch.player2?.name}
              </div>
              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{editMatch.player1?.name} Goals</label>
                  <input className="form-input" type="number" min="0" value={editForm.p1g} onChange={(e) => setEditForm({ ...editForm, p1g: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{editMatch.player2?.name} Goals</label>
                  <input className="form-input" type="number" min="0" value={editForm.p2g} onChange={(e) => setEditForm({ ...editForm, p2g: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Notes</label>
                <input className="form-input" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="e.g. Lag doesn't count" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={saveMatch} disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditMatch(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {matches.map((m) => {
                const p1win = m.result === 'player1_win', p2win = m.result === 'player2_win', draw = m.result === 'draw';
                return (
                  <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
                    <div style={{ flex: 1, fontWeight: 600, color: p1win ? 'var(--win)' : p2win ? 'var(--loss)' : 'var(--draw)' }}>{m.player1?.name}</div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem', letterSpacing: '3px' }}>{m.score.player1Goals}–{m.score.player2Goals}</div>
                    <div style={{ flex: 1, fontWeight: 600, textAlign: 'right', color: p2win ? 'var(--win)' : p1win ? 'var(--loss)' : 'var(--draw)' }}>{m.player2?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', minWidth: '80px', textAlign: 'right' }}>{fmtD(m.playedAt)}</div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditMatch(m)} title="Edit">✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmMatchId(m._id)} title="Delete">🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── COMPETITIONS ── */}
      {section === 'competitions' && (
        <>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <span className="section-title">All Competitions</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{comps.length} total</span>
          </div>

          {compsLoading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : comps.length === 0 ? (
            <div className="empty"><div className="empty-icon">🎯</div><p>No competitions yet.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {comps.map((c) => (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.6rem' }}>{c.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {c.semester || 'No semester'} · {c.requiresApproval ? 'Needs approval' : 'Auto-approved'}
                    </div>
                  </div>
                  <span className={c.isActive ? 'comp-active' : 'comp-inactive'} style={{ fontSize: '0.82rem' }}>
                    {c.isActive ? '● Active' : '○ Ended'}
                  </span>
                  <button className={`btn btn-sm ${c.isActive ? 'btn-ghost' : 'btn-green'}`} onClick={() => handleToggleComp(c)}>
                    {c.isActive ? '🔒 Close' : '🔓 Reopen'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── COUNCIL MEMBERS ── */}
      {section === 'council' && (
        <>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <span className="section-title">All Members</span>
          </div>

          {usersLoading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Admins first */}
              {allUsers.filter(u => u.role === 'admin').map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.5rem' }}>👮</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{u.name} {u._id === user?._id ? <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>(you)</span> : ''}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{u.phone}</div>
                  </div>
                  <span className="pill pill-pending">Admin</span>
                </div>
              ))}
              {/* Bros */}
              {allUsers.filter(u => u.role === 'bro').map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.5rem' }}>⚽</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{u.phone}</div>
                  </div>
                  <span className="pill pill-approved">Bro</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Match Confirm Modal */}
      {confirmMatchId && (
        <ConfirmModal
          title="Delete this match?"
          message="This will permanently remove the match from the record books. Stats will not auto-update here — refresh the FIFA page."
          confirmLabel="Yes, Delete"
          danger
          onConfirm={() => delMatch(confirmMatchId)}
          onCancel={() => setConfirmMatchId(null)}
        />
      )}
    </div>
  );
}
