import { useState } from 'react';

const fmt = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;

export default function BookingModal({ slot, onConfirm, onClose, loading }) {
  const [purpose, setPurpose] = useState('');

  if (!slot) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Confirm Booking</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Review your selection and add a purpose</p>

        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="Hall"  value={slot.hallName} />
          <Row label="Date"  value={new Date(slot.date).toDateString()} />
          <Row label="Time"  value={`${fmt(slot.startHour)} – ${fmt(slot.endHour)}`} />
          <Row label="Duration" value={`${slot.endHour - slot.startHour} hour${slot.endHour - slot.startHour > 1 ? 's' : ''}`} />
        </div>

        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
          Purpose / Event Name <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          rows={3} placeholder="e.g. Annual Tech Symposium, Club Meeting..."
          value={purpose} onChange={e => setPurpose(e.target.value)}
          style={{ resize: 'none', marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={() => onConfirm(purpose)} disabled={!purpose.trim() || loading}>
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
