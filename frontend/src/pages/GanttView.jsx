import { useState, useEffect, useCallback } from "react";
import {
  startOfWeek,
  addWeeks,
  addDays,
  format,
  isAfter,
  startOfDay,
} from "date-fns";
import api from "../api/axios.js";
import GanttChart from "../components/GanttChart.jsx";
import BookingModal from "../components/BookingModal.jsx";
import { toast } from "../components/Toast.jsx";
import ToastContainer from "../components/Toast.jsx";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Earliest bookable date is always tomorrow
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return startOfDay(d);
};

// Default day tab: index of tomorrow within the current week (0=Mon … 6=Sun)
const defaultDayIndex = () => {
  const t = tomorrow();
  const day = t.getDay(); // 0=Sun,1=Mon…
  return day === 0 ? 6 : day - 1;
};

export default function GanttView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayIndex, setDayIndex] = useState(defaultDayIndex);
  const [halls, setHalls] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slot, setSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), {
    weekStartsOn: 1,
  });
  const selectedDate = addDays(weekStart, dayIndex);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, bRes] = await Promise.all([
        api.get("/halls"),
        api.get(`/bookings/week?start=${format(weekStart, "yyyy-MM-dd")}`),
      ]);
      setHalls(hRes.data);
      setBookings(bRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    load();
  }, [load]);

  const dayBookings = bookings.filter(
    (b) =>
      format(new Date(b.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd"),
  );

  const handleConfirm = async (purpose) => {
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        hallId: slot.hallId,
        date: format(slot.date, "yyyy-MM-dd"),
        startHour: slot.startHour,
        endHour: slot.endHour,
        purpose,
      });
      toast.success("Booking request submitted!");
      setSlot(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ToastContainer />

      {/* Header */}
      <div
        style={{
          padding: "20px 24px 0",
          borderBottom: "1px solid #e2e8f0",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Venue Schedule
            </h1>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Week of {format(weekStart, "MMM d")} –{" "}
              {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn-ghost btn-sm"
              onClick={() => {
                setWeekOffset((p) => p - 1);
                setDayIndex(defaultDayIndex());
              }}
            >
              ← Prev
            </button>
            <button
              className="btn-ghost btn-sm"
              onClick={() => {
                setWeekOffset(0);
                setDayIndex(defaultDayIndex());
              }}
              style={{ fontWeight: 600 }}
            >
              Today
            </button>
            <button
              className="btn-ghost btn-sm"
              onClick={() => {
                setWeekOffset((p) => p + 1);
                setDayIndex(defaultDayIndex());
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Day Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {DAY_LABELS.map((label, i) => {
            const d = addDays(weekStart, i);
            const isPast = !isAfter(startOfDay(d), startOfDay(new Date())); // today & earlier are blocked
            const active = dayIndex === i;
            return (
              <button
                key={i}
                onClick={() => !isPast && setDayIndex(i)}
                disabled={isPast}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  cursor: isPast ? "not-allowed" : "pointer",
                  background: active ? "#2563eb" : "transparent",
                  color: active ? "#fff" : isPast ? "#cbd5e1" : "#64748b",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  transition: "all .15s",
                  borderBottom: active
                    ? "2px solid #2563eb"
                    : "2px solid transparent",
                  opacity: isPast ? 0.5 : 1,
                  position: "relative",
                }}
              >
                <div>
                  {label} {isPast ? "🔒" : ""}
                </div>
                <div style={{ fontSize: 11 }}>{format(d, "MMM d")}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "10px 24px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
          Legend:
        </span>
        {[
          ["pending", "#fef3c7", "#f59e0b", "#92400e"],
          ["approved", "#dcfce7", "#16a34a", "#14532d"],
          ["rejected", "#fee2e2", "#dc2626", "#7f1d1d"],
        ].map(([s, bg, border, color]) => (
          <div
            key={s}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: bg,
                border: `1.5px solid ${border}`,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color,
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {s}
            </span>
          </div>
        ))}
        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>
          💡 Drag across cells to select a time range and book
        </span>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
            }}
          >
            <div className="spin" />
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <GanttChart
              halls={halls}
              bookings={dayBookings}
              date={selectedDate}
              onSlotSelect={setSlot}
            />
          </div>
        )}
      </div>

      <BookingModal
        slot={slot}
        onConfirm={handleConfirm}
        onClose={() => setSlot(null)}
        loading={submitting}
      />
    </div>
  );
}
