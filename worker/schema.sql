-- Letters to Akie: one row per message a reader sends.
-- Nothing is shown on the site until status = 'approved'.
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story TEXT NOT NULL,               -- the story id from assets/library.js
  name TEXT NOT NULL,                -- the reader's first name or nickname
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' or 'approved'
  created_at TEXT NOT NULL,          -- ISO date, e.g. 2026-09-12T21:04:11.000Z
  ip_hash TEXT                       -- hashed, never the address itself (used only to slow down floods)
);
CREATE INDEX IF NOT EXISTS comments_by_story ON comments (story, status, created_at);
CREATE INDEX IF NOT EXISTS comments_by_status ON comments (status, created_at);
