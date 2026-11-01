import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import teamsRouter from "./routes/teams.js";
import h2hRouter from "./routes/h2h.js";
import savedRouter from "./routes/saved.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/teams", teamsRouter);
app.use("/api/h2h", h2hRouter);
app.use("/api/saved", savedRouter);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Express 5 sends errors thrown in async routes here automatically.
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID" });
  res.status(err.status || 500).json({ error: err.message || "Something went wrong on the server" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}/api`));
  })
  .catch((err) => {
    console.error("Could not start server:", err.message);
    process.exit(1);
  });
