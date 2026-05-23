import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import hallRoutes from "./routes/halls.js";
import bookingRoutes from "./routes/bookings.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/bookings", bookingRoutes);
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", app: "SpaceSync" }),
);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/spacesync";

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`SpaceSync API → http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });
