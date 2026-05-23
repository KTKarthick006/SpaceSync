import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import GanttView from "./pages/GanttView.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

// Handles /auth/callback?token=xxx from Google OAuth redirect
function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const {} = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("ss_token", token);
      window.location.href = "/"; // full reload to re-init AuthContext
    } else {
      navigate("/login?error=oauth_failed");
    }
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="spin" />
    </div>
  );
}

function Guard({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route
            path="/"
            element={
              <Guard>
                <Layout />
              </Guard>
            }
          >
            <Route index element={<GanttView />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route
              path="admin"
              element={
                <Guard admin>
                  <AdminPanel />
                </Guard>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
