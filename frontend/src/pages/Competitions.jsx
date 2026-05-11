import { useEffect, useState } from 'react';
import { getCompetitions, createCompetition, toggleCompetition, getScoreboard, getLogs, createLog, getUsers, joinCompetition } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Competitions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comps, setComps] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scoreboard, setScoreboard] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', emoji: '🏆', requiresApproval: true, semester: '', participants: [] });
  const [claimNote, setClaimNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  const load = () =>
    Promise.all([getCompetitions(), getUsers()])
      .then(([c, u]) => { setComps(c.data.data); setUsers(u.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const canViewComp = (comp) => user?.role === 'admin' || comp.participants.some(p => p._id === user?._id);

  const handleJoin = async (comp, e) => {
    e.stopPropagation();
    try {
      const res = await joinCompetition(comp._id);
      const updated = res.data.data;
      setComps(comps.map(c => c._id === comp._id ? updated : c));
      toast('Joined competition! 🎉');
      openComp(updated);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to join', 'error');
    }
  };

  const openComp = async (comp) => {
    setSelected(comp);
    setLogFilter('all');
    const [sb, lg] = await Promise.all([getScoreboard(comp._id), getLogs({ competition: comp._id })]);
    setScoreboard(sb.data.data);
    setLogs(lg.data.data);
  };

  const refreshComp = async (comp) => {
    const [sb, lg] = await Promise.all([getScoreboard(comp._id), getLogs({ competition: comp._id })]);
    setScoreboard(sb.data.data);
    setLogs(lg.data.data);
  };

  // Auto-refresh scoreboard and logs every 5 seconds when viewing a competition
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      refreshComp(selected);
    }, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  const handle = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const toggleParticipant = (id) => {
    const parts = form.participants.includes(id)
      ? form.participants.filter((p) => p !== id)
      : [...form.participants, id];
    setForm({ ...form, participants: parts });
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCompetition(form);
      setShowCreate(false);
      setForm({ title: '', description: '', emoji: '🏆', requiresApproval: true, semester: '', participants: [] });
      toast('Competition created! 🎯');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to create', 'error');
    } finally { setSaving(false); }
  };

  const submitClaim = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createLog({ competition: selected._id, note: claimNote });
      setLogs([res.data.data, ...logs]);
      setClaimNote('');
      setShowClaim(false);
      const needsApproval = selected.requiresApproval;
      toast(needsApproval ? '⏳ Claim submitted — awaiting Council approval' : '✅ Event recorded!', needsApproval ? 'info' : 'success');
      if (!needsApproval) {
        const sb = await getScoreboard(selected._id);
        setScoreboard(sb.data.data);
      }
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to claim', 'error');
    } finally { setSaving(false); }
  };

  const handleToggle = async () => {
    try {
      const res = await toggleCompetition(selected._id);
      const updated = res.data.data;
      setSelected({ ...selected, isActive: updated.isActive });
      setComps(comps.map(c => c._id === selected._id ? { ...c, isActive: updated.isActive } : c));
      toast(updated.isActive ? '✅ Competition reopened' : '🔒 Competition closed');
    } catch {
      toast('Failed to toggle competition', 'error');
    }
  };

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /></div></div>;

  if (selected) {
    const myPending = logs.filter(l => l.user?._id === user?._id && l.status === 'pending');
    const myApproved = logs.filter(l => l.user?._id === user?._id && l.status === 'approved');
    const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.status === logFilter);

    return (
      <div className="page">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => setSelected(null)}>← Back</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{selected.emoji}</span>
            <div>
              <div className="page-title" style={{ marginBottom: 0 }}>{selected.title}</div>
              {selected.semester && <p className="page-sub" style={{ marginBottom: 0 }}>{selected.semester}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={selected.isActive ? 'comp-active' : 'comp-inactive'} style={{ fontSize: '0.85rem' }}>
              {selected.isActive ? '● Active' : '○ Ended'}
            </span>
            {user?.role === 'admin' && (
              <button className={`btn btn-sm ${selected.isActive ? 'btn-ghost' : 'btn-green'}`} onClick={handleToggle}>
                {selected.isActive ? '🔒 Close' : '🔓 Reopen'}
              </button>
            )}
          </div>
        </div>

        {selected.description && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{selected.description}</p>}

        {/* My stats strip */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="stat-box" style={{ flex: 1, minWidth: '120px' }}>
            <div className="stat-label">My Approved</div>
            <div className="stat-value stat-green">{myApproved.length}</div>
          </div>
          <div className="stat-box" style={{ flex: 1, minWidth: '120px' }}>
            <div className="stat-label">My Pending</div>
            <div className="stat-value stat-purple">{myPending.length}</div>
          </div>
          <div className="stat-box" style={{ flex: 1, minWidth: '120px' }}>
            <div className="stat-label">Total Entries</div>
            <div className="stat-value">{logs.length}</div>
          </div>
          {selected.isActive && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowClaim(true)}>+ Claim Event</button>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="section-header"><span className="section-title">🏅 Scoreboard (Approved)</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
          {scoreboard.length === 0 && <div className="empty"><div className="empty-icon">{selected.emoji}</div><p>No approved entries yet.</p></div>}
          {scoreboard.map((s, i) => (
            <div key={s.userId} className="lb-row">
              <div className={`lb-rank lb-rank-${i + 1}`}>{i + 1}</div>
              <div className="lb-name">
                {s.name} {i === 0 && <span style={{ marginLeft: '0.2rem' }} title="Current Leader">👑</span>} {s.userId === user?._id ? <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>(you)</span> : ''}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.3rem', color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{s.count}</div>
            </div>
          ))}
        </div>

        {/* Logs with filter */}
        <div className="section-header">
          <span className="section-title">📋 Entries</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button key={f} className={`tab ${logFilter === f ? 'active' : ''}`} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setLogFilter(f)}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filteredLogs.length === 0 && <div className="empty"><p>No {logFilter === 'all' ? '' : logFilter} entries.</p></div>}
          {filteredLogs.map((l) => (
            <div key={l._id} className="log-item">
              <div className="log-emoji">{selected.emoji}</div>
              <div className="log-body">
                <div className="log-user">{l.user?.name}</div>
                <div className="log-meta">{fmtTime(l.loggedAt)}{l.note ? ` · "${l.note}"` : ''}</div>
                {l.reviewNote && <div className="log-meta" style={{ color: 'var(--muted)' }}>Council: "{l.reviewNote}"</div>}
              </div>
              <span className={`pill pill-${l.status}`}>{l.status}</span>
            </div>
          ))}
        </div>

        {/* Claim modal */}
        {showClaim && (
          <div className="overlay" onClick={() => setShowClaim(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Claim: {selected.emoji} {selected.title}</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                {selected.requiresApproval ? '⏳ Requires Council approval before it counts.' : '✅ Auto-approved instantly.'}
              </p>
              <form onSubmit={submitClaim} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Proof / Note (optional)</label>
                  <input className="form-input" value={claimNote} onChange={(e) => setClaimNote(e.target.value)} placeholder="e.g. Used blue shampoo, 45 min session..." />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowClaim(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit Claim'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div className="page-title">🎯 Competitions</div>
          <p className="page-sub">Track anything. The bath. The gym. The dishes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Competition</button>
      </div>

      {comps.length === 0 && <div className="empty"><div className="empty-icon">🎯</div><p>No competitions yet. Create the first one!</p></div>}

      {/* Active */}
      {comps.filter(c => c.isActive).length > 0 && (
        <>
          <div className="section-header" style={{ marginBottom: '0.75rem' }}><span className="section-title">🔥 Active</span></div>
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {comps.filter(c => c.isActive).map((c) => {
              const canView = canViewComp(c);
              return (
                <div key={c._id} className="comp-card" onClick={() => canView && openComp(c)} style={{ cursor: canView ? 'pointer' : 'default' }}>
                  <div className="comp-emoji">{c.emoji}</div>
                  <div className="comp-title">{c.title}</div>
                  {c.description && <div className="comp-desc">{c.description}</div>}
                  <div className="comp-footer">
                    <span className="comp-sem">{c.semester || 'No semester'}</span>
                    <span className="comp-active">● Active</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    {c.requiresApproval && <span className="pill pill-pending" style={{ fontSize: '0.72rem' }}>Requires Approval</span>}
                    {!canView && (
                      <button className="btn btn-primary btn-sm" onClick={(e) => handleJoin(c, e)}>
                        Join
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Ended */}
      {comps.filter(c => !c.isActive).length > 0 && (
        <>
          <div className="section-header" style={{ marginBottom: '0.75rem' }}><span className="section-title" style={{ color: 'var(--muted)' }}>🔒 Ended</span></div>
          <div className="grid-2">
            {comps.filter(c => !c.isActive).map((c) => {
              const canView = canViewComp(c);
              return (
                <div key={c._id} className="comp-card" style={{ opacity: 0.6, cursor: canView ? 'pointer' : 'default' }} onClick={() => canView && openComp(c)}>
                  <div className="comp-emoji">{c.emoji}</div>
                  <div className="comp-title">{c.title}</div>
                  {c.description && <div className="comp-desc">{c.description}</div>}
                  <div className="comp-footer">
                    <span className="comp-sem">{c.semester || 'No semester'}</span>
                    <span className="comp-inactive">○ Ended</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    {c.requiresApproval && <span className="pill pill-pending" style={{ fontSize: '0.72rem' }}>Requires Approval</span>}
                    {!canView && <span className="pill pill-rejected" style={{ fontSize: '0.72rem' }}>Cannot Join Ended</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-title">New Competition</div>
            <form onSubmit={submitCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="e.g. Semester Bath Count" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <input className="form-input" name="emoji" value={form.emoji} onChange={handle} placeholder="🚿" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" name="description" value={form.description} onChange={handle} placeholder="What are we tracking?" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input className="form-input" name="semester" value={form.semester} onChange={handle} placeholder="Spring 2026" />
                </div>
                <div className="form-group" style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', paddingTop: '1.4rem' }}>
                  <input type="checkbox" id="reqApproval" name="requiresApproval" checked={form.requiresApproval} onChange={handle} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }} />
                  <label htmlFor="reqApproval" className="form-label" style={{ margin: 0 }}>Requires Approval</label>
                </div>
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Participants</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                    const broIds = users.filter(u => u.role === 'bro').map(u => u._id);
                    setForm({ ...form, participants: form.participants.length === broIds.length ? [] : broIds });
                  }}>
                    {form.participants.length === users.filter(u => u.role === 'bro').length && users.filter(u => u.role === 'bro').length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {users.filter(u => u.role === 'bro').map(u => (
                    <button key={u._id} type="button"
                      className={`btn btn-sm ${form.participants.includes(u._id) ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => toggleParticipant(u._id)}>{u.name}</button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
