import { useState } from "react";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const fmt = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;

const STATUS_COLOR = {
  pending: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  approved: { bg: "#dcfce7", border: "#16a34a", text: "#14532d" },
  rejected: { bg: "#fee2e2", border: "#dc2626", text: "#7f1d1d" },
  cancelled: { bg: "#f1f5f9", border: "#94a3b8", text: "#475569" },
};

const ACTIVE = ["pending", "approved"];

export default function GanttChart({ halls, bookings, date, onSlotSelect }) {
  const [drag, setDrag] = useState(null);
  const [hover, setHover] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const byHall = {};
  halls.forEach((h) => {
    byHall[h._id] = [];
  });
  bookings.forEach((b) => {
    if (byHall[b.hall?._id]) byHall[b.hall._id].push(b);
  });

  const getActiveBookingAt = (hallId, hour) =>
    byHall[hallId]?.find(
      (b) =>
        ACTIVE.includes(b.status) && b.startHour <= hour && hour < b.endHour,
    );

  const isDragging = (hallId, hour) => {
    if (!drag || drag.hallId !== hallId) return false;
    const lo = Math.min(drag.startHour, hover?.hour ?? drag.startHour);
    const hi = Math.max(drag.startHour, hover?.hour ?? drag.startHour);
    return hour >= lo && hour <= hi;
  };

  const handleMouseDown = (hallId, hour) => {
    if (getActiveBookingAt(hallId, hour)) return;
    setDrag({ hallId, startHour: hour });
  };

  const handleMouseEnter = (hallId, hour) => {
    setHover({ hallId, hour });
  };

  const handleMouseUp = (hallId, hour) => {
    if (!drag || drag.hallId !== hallId) {
      setDrag(null);
      return;
    }
    const startHour = Math.min(drag.startHour, hour);
    const endHour = Math.max(drag.startHour, hour) + 1;
    setDrag(null);
    onSlotSelect({
      hallId,
      hallName: halls.find((h) => h._id === hallId)?.name,
      date,
      startHour,
      endHour,
    });
  };

  const cellW = 56;
  const rowH = 44;

  return (
    <div
      style={{ overflowX: "auto", position: "relative", userSelect: "none" }}
    >
      <table
        style={{ borderCollapse: "collapse", minWidth: "100%", fontSize: 12 }}
      >
        <thead>
          <tr>
            <th
              style={{
                width: 200,
                minWidth: 200,
                padding: "8px 14px",
                textAlign: "left",
                background: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
                fontWeight: 600,
                color: "#475569",
                position: "sticky",
                left: 0,
                zIndex: 10,
              }}
            >
              Hall
            </th>
            {HOURS.slice(0, -1).map((h) => (
              <th
                key={h}
                style={{
                  width: cellW,
                  minWidth: cellW,
                  padding: "8px 4px",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                  fontWeight: 500,
                  color: "#94a3b8",
                  borderLeft: "1px solid #e2e8f0",
                }}
              >
                {fmt(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {halls.map((hall, ri) => (
            <tr
              key={hall._id}
              style={{ background: ri % 2 === 0 ? "#fff" : "#fafafa" }}
            >
              <td
                style={{
                  padding: "0 14px",
                  fontWeight: 500,
                  color: "#1e293b",
                  fontSize: 12,
                  borderBottom: "1px solid #e2e8f0",
                  position: "sticky",
                  left: 0,
                  zIndex: 5,
                  background: ri % 2 === 0 ? "#fff" : "#fafafa",
                  height: rowH,
                  borderRight: "2px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 185,
                  }}
                >
                  {hall.name}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                  {hall.capacity} cap · {hall.isAC ? "AC" : "Non-AC"}
                </div>
              </td>

              {HOURS.slice(0, -1).map((hour) => {
                const booking = getActiveBookingAt(hall._id, hour);
                const isFirst = booking && booking.startHour === hour;
                const span = booking ? booking.endHour - booking.startHour : 1;
                const dragging = isDragging(hall._id, hour);

                if (booking && !isFirst) return null;

                return (
                  <td
                    key={hour}
                    colSpan={booking ? span : 1}
                    style={{
                      width: cellW * (booking ? span : 1),
                      height: rowH,
                      borderLeft: "1px solid #e2e8f0",
                      borderBottom: "1px solid #e2e8f0",
                      padding: 2,
                      cursor: booking ? "default" : "cell",
                      background: dragging ? "#bfdbfe" : "transparent",
                      position: "relative",
                      transition: "background .05s",
                    }}
                    onMouseDown={() =>
                      !booking && handleMouseDown(hall._id, hour)
                    }
                    onMouseEnter={() => handleMouseEnter(hall._id, hour)}
                    onMouseUp={() => !booking && handleMouseUp(hall._id, hour)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {booking && (
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 5,
                          background:
                            STATUS_COLOR[booking.status]?.bg || "#f1f5f9",
                          border: `1.5px solid ${STATUS_COLOR[booking.status]?.border || "#94a3b8"}`,
                          color:
                            STATUS_COLOR[booking.status]?.text || "#475569",
                          padding: "2px 6px",
                          fontSize: 11,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          setTooltip({ booking, x: e.clientX, y: e.clientY })
                        }
                        onMouseMove={(e) =>
                          setTooltip((t) =>
                            t ? { ...t, x: e.clientX, y: e.clientY } : null,
                          )
                        }
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {booking.purpose}
                        </span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            background: "#0f172a",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            zIndex: 9000,
            pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,.3)",
            maxWidth: 260,
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {tooltip.booking.purpose}
          </div>
          <div style={{ color: "#94a3b8" }}>
            By: {tooltip.booking.user?.name}
          </div>
          <div style={{ color: "#94a3b8" }}>
            {fmt(tooltip.booking.startHour)} – {fmt(tooltip.booking.endHour)}
          </div>
          <div style={{ marginTop: 4 }}>
            <span
              style={{
                background: STATUS_COLOR[tooltip.booking.status]?.bg,
                color: STATUS_COLOR[tooltip.booking.status]?.text,
                border: `1px solid ${STATUS_COLOR[tooltip.booking.status]?.border}`,
                borderRadius: 99,
                padding: "1px 8px",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {tooltip.booking.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
