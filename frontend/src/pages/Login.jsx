import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'bro', adminPasscode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = isRegister ? register : login;
      const res = await fn(form);
      localStorage.setItem('hos_token', res.data.token);
      setUser(res.data.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">Hall of Shame</div>
        <p className="login-sub">Roommate rivalry, officially documented 🏆</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="e.g. Arpit" required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handle}
              placeholder="e.g. 9876543210"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" name="role" value={form.role} onChange={handle}>
                <option value="bro">Bro (You / Roommate)</option>
                <option value="admin">Admin (Council of Bros 👮)</option>
              </select>
            </div>
          )}
          {isRegister && form.role === 'admin' && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--primary)' }}>Council Passcode</label>
              <input 
                className="form-input" 
                type="password" 
                name="adminPasscode" 
                value={form.adminPasscode} 
                onChange={handle} 
                placeholder="Required for admin role" 
                required 
              />
            </div>
          )}
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <p className="login-toggle">
          {isRegister ? 'Already have an account? ' : "Don't have one? "}
          <span onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Log In' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}
