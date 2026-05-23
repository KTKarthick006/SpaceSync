import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  tls: { rejectUnauthorized: false }
});

const fmt = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;

const base = (body) => `
<div style="font-family:Inter,sans-serif;max-width:580px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
  <div style="background:#0f172a;padding:28px 32px;display:flex;align-items:center;gap:12px">
    <div>
      <h1 style="color:#f59e0b;margin:0;font-size:20px;font-weight:700;letter-spacing:1px">SpaceSync</h1>
      <p style="color:#94a3b8;margin:2px 0 0;font-size:12px">Venue Booking System</p>
    </div>
  </div>
  <div style="padding:32px;background:#ffffff">${body}</div>
  <div style="background:#f8fafc;padding:16px 32px;font-size:12px;color:#94a3b8;text-align:center;border-top:1px solid #e5e7eb">
    Automated email from SpaceSync — please do not reply.
  </div>
</div>`;

const row = (label, value, shade) =>
  `<tr style="background:${shade ? '#f8fafc' : '#fff'}">
    <td style="padding:10px 12px;color:#64748b;font-size:13px;width:38%">${label}</td>
    <td style="padding:10px 12px;font-weight:600;font-size:13px">${value}</td>
  </tr>`;

const table = (booking) => `
  <table style="width:100%;border-collapse:collapse;margin-top:16px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
    ${row('Hall',    booking.hall.name,                       false)}
    ${row('Date',    new Date(booking.date).toDateString(),   true)}
    ${row('Time',    `${fmt(booking.startHour)} – ${fmt(booking.endHour)}`, false)}
    ${row('Purpose', booking.purpose,                         true)}
    ${booking.adminNote ? row('Note', booking.adminNote, false) : ''}
  </table>`;

const send = async (to, subject, html) => {
  if (!process.env.MAIL_USER) {
    console.log(`[Mailer] No MAIL_USER set — skipping "${subject}" to ${to}`);
    return;
  }
  try {
    await transporter.sendMail({ from: process.env.MAIL_FROM || 'SpaceSync <noreply@spacesync.com>', to, subject, html });
    console.log(`[Mailer] ✅ "${subject}" → ${to}`);
  } catch (err) {
    console.error(`[Mailer] ❌ ${err.message}`);
  }
};

export const mailBookingCreated = (b) => {
  send(b.user.email, 'Booking Request Received - SpaceSync', base(`
    <h2 style="color:#0f172a;margin:0 0 8px">Booking Request Submitted</h2>
    <p style="color:#475569;margin:0 0 4px">Hi <strong>${b.user.name}</strong>, your request is pending admin approval.</p>
    ${table(b)}
    <p style="color:#94a3b8;font-size:13px;margin-top:16px">You can cancel this request anytime before it is approved.</p>
  `));
  if (process.env.ADMIN_EMAIL) {
    send(process.env.ADMIN_EMAIL, 'New Booking Request - SpaceSync', base(`
      <h2 style="color:#0f172a;margin:0 0 8px">New Booking Requires Approval</h2>
      <p style="color:#475569;margin:0 0 4px">Requested by <strong>${b.user.name}</strong> (${b.user.email})</p>
      ${table(b)}
      <p style="color:#94a3b8;font-size:13px;margin-top:16px">Log in to the admin panel to approve or reject.</p>
    `));
  }
};

export const mailBookingApproved = (b) => {
  send(b.user.email, 'Booking Approved - SpaceSync', base(`
    <h2 style="color:#16a34a;margin:0 0 8px">Booking Confirmed!</h2>
    <p style="color:#475569;margin:0 0 4px">Hi <strong>${b.user.name}</strong>, your venue is confirmed.</p>
    ${table(b)}
  `));
};

export const mailBookingRejected = (b) => {
  send(b.user.email, 'Booking Rejected - SpaceSync', base(`
    <h2 style="color:#dc2626;margin:0 0 8px">Booking Request Rejected</h2>
    <p style="color:#475569;margin:0 0 4px">Hi <strong>${b.user.name}</strong>, your request could not be approved.</p>
    ${table(b)}
    <p style="color:#94a3b8;font-size:13px;margin-top:16px">You may submit a new request for a different time or venue.</p>
  `));
};

export const mailCancelledByAdmin = (b) => {
  send(b.user.email, 'Booking Cancelled by Admin - SpaceSync', base(`
    <h2 style="color:#d97706;margin:0 0 8px">Your Booking Was Cancelled</h2>
    <p style="color:#475569;margin:0 0 4px">Hi <strong>${b.user.name}</strong>, an administrator has cancelled your booking.</p>
    ${table(b)}
  `));
};