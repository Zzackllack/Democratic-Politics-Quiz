const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { questions, players, lobbies, gameModes } = require("./mockData");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
const dbPath = path.join(__dirname, "db.sqlite");
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      type TEXT,
      question TEXT,
      options TEXT,
      correctAnswer TEXT,
      difficulty TEXT,
      explanation TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT,
      score INTEGER,
      joinedAt TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS lobbies (
      id TEXT PRIMARY KEY,
      name TEXT,
      players TEXT,
      maxPlayers INTEGER,
      gameMode TEXT,
      isActive INTEGER,
      createdAt TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS game_modes (
      id TEXT PRIMARY KEY,
      label TEXT,
      description TEXT,
      color TEXT,
      icon TEXT
    )`);

    db.get("SELECT COUNT(*) AS count FROM questions", (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare("INSERT INTO questions VALUES (?,?,?,?,?,?,?)");
        questions.forEach((q) => {
          stmt.run(
            q.id,
            q.type,
            q.question,
            JSON.stringify(q.options || []),
            String(q.correctAnswer),
            q.difficulty,
            q.explanation
          );
        });
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) AS count FROM players", (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare("INSERT INTO players VALUES (?,?,?,?)");
        players.forEach((p) => {
          stmt.run(p.id, p.name, p.score, p.joinedAt);
        });
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) AS count FROM lobbies", (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare("INSERT INTO lobbies VALUES (?,?,?,?,?,?,?)");
        lobbies.forEach((l) => {
          stmt.run(
            l.id,
            l.name,
            JSON.stringify(l.players),
            l.maxPlayers,
            l.gameMode,
            l.isActive ? 1 : 0,
            l.createdAt
          );
        });
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) AS count FROM game_modes", (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare("INSERT INTO game_modes VALUES (?,?,?,?,?)");
        Object.entries(gameModes).forEach(([id, gm]) => {
          stmt.run(id, gm.label, gm.description, gm.color, gm.icon);
        });
        stmt.finalize();
      }
    });
  });
}

initDb();

app.get("/api/questions", (req, res) => {
  db.all("SELECT * FROM questions", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map((r) => ({
      id: r.id,
      type: r.type,
      question: r.question,
      options: JSON.parse(r.options),
      correctAnswer:
        r.correctAnswer === "true" ? true : r.correctAnswer === "false" ? false : r.correctAnswer,
      difficulty: r.difficulty,
      explanation: r.explanation,
    }));
    res.json(data);
  });
});

app.get("/api/players", (req, res) => {
  db.all("SELECT * FROM players", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      score: r.score,
      joinedAt: r.joinedAt,
    }));
    res.json(data);
  });
});

app.post("/api/players", (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Name and score required" });
  }
  const id = Date.now().toString();
  const joinedAt = new Date().toISOString();
  db.run(
    "INSERT INTO players (id, name, score, joinedAt) VALUES (?,?,?,?)",
    [id, name, score, joinedAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, score, joinedAt });
    }
  );
});

app.get("/api/lobbies", (req, res) => {
  db.all("SELECT * FROM lobbies", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      players: JSON.parse(r.players),
      maxPlayers: r.maxPlayers,
      gameMode: r.gameMode,
      isActive: !!r.isActive,
      createdAt: r.createdAt,
    }));
    res.json(data);
  });
});

app.get("/api/game-modes", (req, res) => {
  db.all("SELECT * FROM game_modes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = {};
    rows.forEach((r) => {
      data[r.id] = {
        label: r.label,
        description: r.description,
        color: r.color,
        icon: r.icon,
      };
    });
    res.json(data);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
