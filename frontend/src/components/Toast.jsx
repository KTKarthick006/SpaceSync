import { useState, useCallback, useEffect } from 'react';

let _add = null;
export const toast = { success: (m) => _add?.('success', m), error: (m) => _add?.('error', m), info: (m) => _add?.('info', m) };

const colors = { success: '#16a34a', error: '#dc2626', info: '#2563eb' };
const icons  = { success: '✅', error: '❌', info: 'ℹ️' };

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, message) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { _add = add; return () => { _add = null; }; }, [add]);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: '#fff', border: `1px solid ${colors[t.type]}`, borderLeft: `4px solid ${colors[t.type]}`,
          borderRadius: 8, padding: '10px 16px', boxShadow: '0 4px 12px rgba(0,0,0,.1)',
          display: 'flex', alignItems: 'center', gap: 8, minWidth: 260, maxWidth: 380,
          animation: 'slideIn .2s ease'
        }}>
          <span>{icons[t.type]}</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}
