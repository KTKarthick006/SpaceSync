import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../api/axios.js';
import { toast } from '../components/Toast.jsx';
import ToastContainer from '../components/Toast.jsx';

const fmt = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;

const BADGE = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-cancelled' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/bookings'); setBookings(r.data); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally { setCancelling(null); }
  };

  return (
    <div style={{ padding: 28 }}>
      <ToastContainer />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>My Bookings</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>Track and manage your venue booking requests</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spin" /></div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No bookings yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Go to Gantt View and drag a time slot to create one</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <div key={b._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Status stripe */}
              <div style={{ width: 4, height: 48, borderRadius: 99, background: b.status === 'approved' ? '#16a34a' : b.status === 'pending' ? '#f59e0b' : b.status === 'rejected' ? '#dc2626' : '#94a3b8', flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{b.hall?.name}</span>
                  <span className={`badge ${BADGE[b.status]}`}>{b.status}</span>
                </div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                  {format(new Date(b.date), 'EEE, MMM d yyyy')} · {fmt(b.startHour)} – {fmt(b.endHour)}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 1 }}>
                  {b.purpose}
                  {b.adminNote && <span style={{ marginLeft: 8, color: '#f59e0b' }}>📝 {b.adminNote}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {b.status === 'pending' && (
                  <button className="btn-danger btn-sm" onClick={() => cancel(b._id)} disabled={cancelling === b._id}>
                    {cancelling === b._id ? '…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
