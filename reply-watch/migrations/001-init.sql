CREATE TABLE reply (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  occurred_us_at INTEGER NOT NULL CHECK (occurred_us_at >= 0),
  display_name TEXT,
  reference_url TEXT,
  CHECK ((status = 'pending' AND display_name IS NOT NULL AND reference_url IS NOT NULL)
      OR (status = 'done' AND display_name IS NULL AND reference_url IS NULL))
);

CREATE INDEX reply_status_time ON reply(status, occurred_us_at);
