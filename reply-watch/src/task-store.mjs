export class TaskStore {
  #upsert

  constructor(db) {
    this.#upsert = db.prepare(`
      INSERT INTO reply (source_id, status, occurred_us_at, display_name, reference_url)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(source_id) DO UPDATE SET
        status = excluded.status,
        occurred_us_at = excluded.occurred_us_at,
        display_name = excluded.display_name,
        reference_url = excluded.reference_url
      WHERE excluded.occurred_us_at > reply.occurred_us_at
         OR (excluded.occurred_us_at = reply.occurred_us_at
             AND excluded.status = 'done' AND reply.status = 'pending')
    `)
  }

  save(sourceId, status, occurredAt, displayName, referenceUrl) {
    this.#upsert.run(sourceId, status, occurredAt, displayName, referenceUrl)
  }
}
