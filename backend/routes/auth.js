import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pick = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// ── Admin login (bcrypt) ─────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.role !== "admin")
      return res.status(401).json({ message: "Invalid credentials" });
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });
    res.json({ token: sign(user._id), user: pick(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Google OAuth — redirect ──────────────────────────────
router.get("/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ── Google OAuth — callback ──────────────────────────────
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code)
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);

    // Exchange code for tokens
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    // Get user info
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
      },
    );

    const { email, name, sub: googleId } = userInfo.data;

    // Upsert user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: "user",
        password: googleId,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = sign(user._id);
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error("Google OAuth error:", err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
});

// ── Me ───────────────────────────────────────────────────
router.get("/me", protect, (req, res) => res.json({ user: pick(req.user) }));

export default router;
