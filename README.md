# SpaceSync — Venue Booking System

A full-stack hall booking platform built with React, Node.js, Express, and MongoDB. Features a Gantt-chart weekly scheduler where users can drag to select time slots across 13 venues, submit booking requests, and track their status. Admins can approve, reject, or cancel bookings with optional notes. Email notifications are sent automatically on every booking action.

## Tech Stack

- **Frontend:** React 18, Vite, date-fns, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # fill in your values
npm start
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — any long random string
- `MAIL_*` — Gmail SMTP credentials
- `CLIENT_URL` — frontend URL
