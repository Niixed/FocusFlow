import express from "express";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync, mkdirSync } from "fs";

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(process.cwd(), "data");
const SESSION_PATH = path.join(DATA_DIR, "sessions.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");


app.use(express.json());
app.use(express.static(PUBLIC_DIR));


if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR);


async function readSessions() {
  try {
    const data = await fs.readFile(SESSION_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}


async function writeSessions(sessions) {
  await fs.writeFile(SESSION_PATH, JSON.stringify(sessions, null, 2));
}


app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await readSessions();
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read sessions" });
  }
});


app.post("/api/sessions", async (req, res) => {
  const { task, duration } = req.body;

  if (!task || typeof task !== "string" || !duration || typeof duration !== "number") {
    return res.status(400).json({ error: "Invalid session data" });
  }

  const newSession = { id: uuidv4(), task, duration, createdAt: new Date().toISOString() };

  try {
    const sessions = await readSessions();
    sessions.push(newSession);
    await writeSessions(sessions);
    res.status(201).json({ message: "Session saved", session: newSession });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save session" });
  }
});


app.delete("/api/sessions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sessions = await readSessions();
    const filtered = sessions.filter(session => session.id !== id);

    if (filtered.length === sessions.length) {
      return res.status(404).json({ error: "Session not found" });
    }

    await writeSessions(filtered);
    res.json({ message: "Session deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

// DELETE all sessions
app.delete("/api/sessions", async (req, res) => {
  try {
    await writeSessions([]);
    res.json({ message: "All sessions cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear sessions" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
