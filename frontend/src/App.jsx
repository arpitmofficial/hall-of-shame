import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Home from './pages/Home';
import FIFA from './pages/FIFA';
import Competitions from './pages/Competitions';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import './index.css';

const Nav = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">Hall of Shame 🏆</NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <span>Home</span>
        </NavLink>
        <NavLink to="/fifa" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <span>⚽ FIFA</span>
        </NavLink>
        <NavLink to="/competitions" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <span>🎯 Challenges</span>
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span>👮 Council</span>
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <span>👤 Profile</span>
        </NavLink>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

function AppInner() {
  const { user } = useAuth();
  return (
    <>
      {user && <Nav />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/fifa" element={<PrivateRoute><FIFA /></PrivateRoute>} />
        <Route path="/competitions" element={<PrivateRoute><Competitions /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// BrowserRouter MUST wrap AuthProvider so useNavigate() works in Login
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
