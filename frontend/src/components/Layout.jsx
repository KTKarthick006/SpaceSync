import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const nav = { display: 'flex', flexDirection: 'column', gap: 4 };
const link = ({ isActive }) => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
  borderRadius: 8, textDecoration: 'none', fontWeight: 500, fontSize: 14,
  color: isActive ? '#2563eb' : '#475569',
  background: isActive ? '#eff6ff' : 'transparent',
  transition: 'all .15s'
});

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#0f172a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#f59e0b', fontSize: 16 }}>⬡</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>SpaceSync</div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Venue Booking</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ ...nav, padding: '12px 10px', flex: 1 }}>
          <NavLink to="/" end style={link}>
            <span>📅</span> Gantt View
          </NavLink>
          <NavLink to="/my-bookings" style={link}>
            <span>🗂️</span> My Bookings
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" style={link}>
              <span>🛡️</span> Admin Panel
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button className="btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}
