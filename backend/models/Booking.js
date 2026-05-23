import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  hall: { type: mongoose.Schema.Types.ObjectId, ref: "Hall", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  startHour: { type: Number, required: true, min: 8, max: 19 },
  endHour: { type: Number, required: true, min: 9, max: 20 },
  purpose: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
  },
  adminNote: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Fast lookup index for week view queries
bookingSchema.index({ hall: 1, date: 1, status: 1 });

// Partial unique index — enforces no two active (pending/approved) bookings
// can overlap for the same hall on the same date and startHour.
// The database itself rejects duplicates atomically, preventing race conditions.
bookingSchema.index(
  { hall: 1, date: 1, startHour: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
    name: "unique_active_booking",
  },
);

bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Booking", bookingSchema);
