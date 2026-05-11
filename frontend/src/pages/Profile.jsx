import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile, getStats, getLogs } from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  
  // Stats state
  const [fifaStats, setFifaStats] = useState(null);
  const [approvedLogs, setApprovedLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      
      Promise.all([
        getStats(),
        getLogs({ user: user._id, status: 'approved' })
      ])
        .then(([sRes, lRes]) => {
          const stats = sRes.data.data.find(s => s.userId === user._id);
          setFifaStats(stats || { matches: 0, wins: 0, draws: 0, losses: 0, winRate: 0 });
          setApprovedLogs(lRes.data.data.length);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast('Name cannot be empty', 'error');
    if (name === user.name) return toast('No changes made');
    
    setSaving(true);
    try {
      const res = await updateProfile({ name });
      setUser(res.data.data);
      toast('Profile updated successfully! ✅');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /></div></div>;

  return (
    <div className="page" style={{ maxWidth: '600px' }}>
      <div className="page-title">👤 My Profile</div>
      <p className="page-sub">Manage your account and view your Hall of Shame footprint.</p>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Edit Details</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number (Login ID)</label>
            <input 
              className="form-input" 
              value={user?.phone || ''} 
              disabled 
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              Phone number cannot be changed.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ padding: '0.6rem 0' }}>
              <span className={`pill ${user?.role === 'admin' ? 'pill-pending' : 'pill-approved'}`}>
                {user?.role === 'admin' ? '👮 Admin Council' : '⚽ Bro Player'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="section-header">
        <span className="section-title">📊 Lifetime Stats</span>
      </div>
      
      <div className="grid-2">
        <div className="stat-box">
          <div className="stat-label">FIFA Win Rate</div>
          <div className="stat-value">{fifaStats?.winRate || 0}%</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {fifaStats?.wins}W · {fifaStats?.draws}D · {fifaStats?.losses}L
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">Total Matches</div>
          <div className="stat-value">{fifaStats?.matches || 0}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Logged in Arena
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-label">Approved Claims</div>
          <div className="stat-value stat-green">{approvedLogs}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Across all competitions
          </div>
        </div>
      </div>
    </div>
  );
}
