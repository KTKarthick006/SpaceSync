import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { loginAdmin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submitAdmin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginAdmin(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 24px 60px rgba(0,0,0,.3)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "#0f172a",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <span style={{ fontSize: 26 }}>⬡</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
            SpaceSync
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Venue Booking System</p>
        </div>

        {!showAdmin ? (
          <>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 20,
                color: "#1e293b",
                textAlign: "center",
              }}
            >
              Sign in to continue
            </h2>

            {/* Google Sign In */}
            <button
              onClick={loginWithGoogle}
              style={{
                width: "100%",
                padding: "11px",
                fontSize: 15,
                fontWeight: 600,
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                transition: "all .15s",
                marginBottom: 16,
                color: "#1e293b",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8fafc")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20H24v8h11.3C33.6 32.5 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.8l5.7-5.7C33.5 7.1 29 5 24 5 13 5 4 14 4 25s9 20 20 20c11 0 19.3-7.7 19.3-20 0-1.3-.1-2.7-.4-4h.7v-1z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c2.8 0 5.3 1 7.2 2.8l5.7-5.7C33.5 7.1 29 5 24 5c-7.7 0-14.3 4.3-17.7 9.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 45c5 0 9.5-1.9 12.9-5l-6-4.9C29.2 36.7 26.7 37.5 24 37.5c-5.2 0-9.5-3.4-11.1-8.1l-6.5 5C9.6 40.6 16.3 45 24 45z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.5l6 4.9C40.5 35.3 43.3 30.6 43.3 25c0-1.3-.1-2.7-.4-4h.7v-1z"
                />
              </svg>
              Continue with Google
            </button>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                onClick={() => setShowAdmin(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Admin login
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 20,
                color: "#1e293b",
              }}
            >
              Admin Sign In
            </h2>

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #dc2626",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#7f1d1d",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 5,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@spacesync.com"
                  value={form.email}
                  onChange={set("email")}
                  onKeyDown={(e) => e.key === "Enter" && submitAdmin()}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 5,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  onKeyDown={(e) => e.key === "Enter" && submitAdmin()}
                />
              </div>
              <button
                className="btn-primary"
                style={{ padding: "11px", fontSize: 15, marginTop: 4 }}
                onClick={submitAdmin}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                onClick={() => {
                  setShowAdmin(false);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Back to Google login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
