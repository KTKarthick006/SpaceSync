import express from "express";
import Booking from "../models/Booking.js";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  mailBookingCreated,
  mailBookingApproved,
  mailBookingRejected,
  mailCancelledByAdmin,
} from "../utils/mailer.js";

const router = express.Router();
const pop = (q) =>
  q.populate("hall", "name capacity isAC").populate("user", "name email");

// Week view
router.get("/week", protect, async (req, res) => {
  try {
    const start = new Date(req.query.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const bookings = await pop(
      Booking.find({
        date: { $gte: start, $lt: end },
        status: { $in: ["pending", "approved"] },
      }),
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All bookings (admin) or own (user)
router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    res.json(await pop(Booking.find(filter).sort({ createdAt: -1 })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create booking
router.post("/", protect, async (req, res) => {
  try {
    const { hallId, date, startHour, endHour, purpose } = req.body;
    if (!hallId || !date || startHour == null || endHour == null || !purpose)
      return res.status(400).json({ message: "All fields required" });
    if (startHour >= endHour)
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    if (startHour < 8 || endHour > 20)
      return res
        .status(400)
        .json({ message: "Bookings allowed only 8 AM – 8 PM" });

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);

    if (d < tomorrow)
      return res
        .status(400)
        .json({ message: "Bookings must be from tomorrow onwards" });
    if (d > maxDate)
      return res
        .status(400)
        .json({ message: "Bookings can only be made up to 7 days in advance" });

    const conflict = await Booking.findOne({
      hall: hallId,
      date: d,
      status: { $in: ["pending", "approved"] },
      $and: [{ startHour: { $lt: endHour } }, { endHour: { $gt: startHour } }],
    });
    if (conflict)
      return res
        .status(409)
        .json({ message: "Hall already booked for this time slot" });

    const booking = await Booking.create({
      hall: hallId,
      user: req.user._id,
      date: d,
      startHour,
      endHour,
      purpose,
    });
    const populated = await pop(Booking.findById(booking._id));
    mailBookingCreated(populated);
    res.status(201).json(populated);
  } catch (err) {
    // E11000 = MongoDB duplicate key — race condition where two requests
    // passed the conflict check simultaneously; DB unique index catches it.
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Hall already booked for this time slot" });
    }
    res.status(500).json({ message: err.message });
  }
});

// Cancel (user: pending only | admin: any)
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await pop(Booking.findById(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Not authorised" });
    if (isOwner && !isAdmin && booking.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending bookings can be cancelled" });
    const wasApproved = booking.status === "approved";
    booking.status = "cancelled";
    booking.adminNote = req.body.note || "";
    await booking.save();
    if (isAdmin && wasApproved) mailCancelledByAdmin(booking);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve (admin)
router.patch("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const booking = await pop(Booking.findById(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending bookings can be approved" });
    booking.status = "approved";
    booking.adminNote = req.body.note || "";
    await booking.save();
    mailBookingApproved(booking);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject (admin)
router.patch("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const booking = await pop(Booking.findById(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "cancelled")
      return res
        .status(400)
        .json({ message: "Cannot reject a cancelled booking" });
    booking.status = "rejected";
    booking.adminNote = req.body.note || "";
    await booking.save();
    mailBookingRejected(booking);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
