import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
const dbFile = process.env.DB_FILE || path.join(dataDir, "storage.sqlite");

function ensureDir() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {}
}
ensureDir();
const db = new Database(dbFile);
db.pragma("journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER)");
const stmtGet = db.prepare("SELECT value FROM kv_store WHERE key = ?");
const stmtUpsert = db.prepare("INSERT INTO kv_store (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at");
const legacyJson = path.join(dataDir, "storage.json");
try {
  if (fs.existsSync(legacyJson)) {
    const raw = fs.readFileSync(legacyJson, "utf-8");
    const obj = JSON.parse(raw || "{}");
    const stmtInsertIgnore = db.prepare("INSERT OR IGNORE INTO kv_store (key, value, updated_at) VALUES (?, ?, ?)");
    Object.entries(obj).forEach(([k, v]) => {
      stmtInsertIgnore.run(k, JSON.stringify(v), Date.now());
    });
  }
} catch {}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/storage/:key", (req, res) => {
  const key = req.params.key;
  const row = stmtGet.get(key);
  if (!row) return res.status(200).json({});
  try {
    const parsed = JSON.parse(row.value);
    return res.json({ value: parsed });
  } catch {
    return res.json({ value: row.value });
  }
});

app.put("/api/storage/:key", (req, res) => {
  const key = req.params.key;
  const { value } = req.body ?? {};
  const s = JSON.stringify(value ?? null);
  stmtUpsert.run(key, s, Date.now());
  res.json({ ok: true });
});

const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
} else {
  console.warn("dist/ not found. Only API will be served.");
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
