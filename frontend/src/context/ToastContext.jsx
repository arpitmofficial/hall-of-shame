import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 9999,
      }}>
        {toasts.map((t) => (
          <div key={t.id} onClick={() => remove(t.id)} style={{
            background: t.type === 'success' ? 'rgba(34,197,94,0.12)' : t.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(167,139,250,0.12)',
            border: `1px solid ${t.type === 'success' ? 'rgba(34,197,94,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(167,139,250,0.4)'}`,
            color: t.type === 'success' ? 'var(--win)' : t.type === 'error' ? 'var(--loss)' : 'var(--pending)',
            padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.88rem',
            fontWeight: 500, cursor: 'pointer', maxWidth: '320px',
            backdropFilter: 'blur(8px)',
            animation: 'slideIn 0.25s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {t.type === 'success' ? '✅ ' : t.type === 'error' ? '❌ ' : 'ℹ️ '}{t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
