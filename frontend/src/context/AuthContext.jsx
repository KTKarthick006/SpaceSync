import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ss_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem("ss_token"))
      .finally(() => setLoading(false));
  }, []);

  const loginAdmin = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ss_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = () => {
    const base =
      import.meta.env.VITE_API_URL || "https://spacesync-rlzt.onrender.com";
    window.location.href = `${base}/api/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem("ss_token");
    setUser(null);
  };

  return (
    <Ctx.Provider
      value={{ user, loading, loginAdmin, loginWithGoogle, logout }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
