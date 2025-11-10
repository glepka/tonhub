import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./utils/errorHandler.js";
import workersRouter from "./routes/workers.js";
import boxesRouter from "./routes/boxes.js";
import servicesRouter from "./routes/services.js";
import bookingsRouter from "./routes/bookings.js";
import settingsRouter from "./routes/settings.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/workers", workersRouter);
app.use("/api/boxes", boxesRouter);
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/settings", settingsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

