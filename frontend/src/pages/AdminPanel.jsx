import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../api/axios.js';
import { toast } from '../components/Toast.jsx';
import ToastContainer from '../components/Toast.jsx';

const fmt = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
const BADGE = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-cancelled' };

export default function AdminPanel() {
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('pending');
  const [acting,    setActing]    = useState(null);
  const [noteModal, setNoteModal] = useState(null); // { id, action }
  const [note,      setNote]      = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/bookings'); setBookings(r.data); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action, adminNote = '') => {
    setActing(id + action);
    try {
      await api.patch(`/bookings/${id}/${action}`, { note: adminNote });
      toast.success(`Booking ${action}d successfully`);
      setNoteModal(null); setNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally { setActing(null); }
  };

  const openNote = (id, action) => { setNoteModal({ id, action }); setNote(''); };

  const filtered = bookings.filter(b => filter === 'all' ? true : b.status === filter);

  const counts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});

  return (
    <div style={{ padding: 28 }}>
      <ToastContainer />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Admin Panel</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>Manage all venue booking requests</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Pending',   count: counts.pending   || 0, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Approved',  count: counts.approved  || 0, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Rejected',  count: counts.rejected  || 0, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Cancelled', count: counts.cancelled || 0, color: '#94a3b8', bg: '#f1f5f9' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 99, border: '1px solid #e2e8f0', cursor: 'pointer',
            background: filter === f ? '#0f172a' : '#fff', color: filter === f ? '#fff' : '#475569',
            fontWeight: filter === f ? 600 : 400, fontSize: 13, textTransform: 'capitalize'
          }}>{f} {f !== 'all' && counts[f] ? `(${counts[f]})` : ''}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          <div style={{ fontWeight: 600 }}>No {filter} bookings</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => (
            <div key={b._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{b.hall?.name}</span>
                  <span className={`badge ${BADGE[b.status]}`}>{b.status}</span>
                </div>
                <div style={{ color: '#475569', fontSize: 13 }}>
                  <strong>{b.user?.name}</strong> · {b.user?.email}
                </div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                  {format(new Date(b.date), 'EEE, MMM d yyyy')} · {fmt(b.startHour)} – {fmt(b.endHour)}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 1 }}>
                  {b.purpose}
                  {b.adminNote && <span style={{ marginLeft: 8, color: '#f59e0b' }}>📝 {b.adminNote}</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {b.status === 'pending' && (<>
                  <button className="btn-success btn-sm" disabled={!!acting} onClick={() => openNote(b._id, 'approve')}>✓ Approve</button>
                  <button className="btn-danger btn-sm"  disabled={!!acting} onClick={() => openNote(b._id, 'reject')}>✕ Reject</button>
                </>)}
                {(b.status === 'pending' || b.status === 'approved') && (
                  <button className="btn-warning btn-sm" disabled={!!acting} onClick={() => openNote(b._id, 'cancel')}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      {noteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setNoteModal(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, textTransform: 'capitalize' }}>
              {noteModal.action} Booking
            </h3>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>Optionally add a note for the user</p>
            <textarea rows={3} placeholder="Optional note (reason, instructions…)" value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'none', marginBottom: 18 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setNoteModal(null)}>Back</button>
              <button
                className={noteModal.action === 'approve' ? 'btn-success' : noteModal.action === 'reject' ? 'btn-danger' : 'btn-warning'}
                disabled={!!acting}
                onClick={() => act(noteModal.id, noteModal.action, note)}
                style={{ textTransform: 'capitalize' }}
              >
                {acting ? '…' : noteModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
