export class TaskStore {
  #upsert
  #pending

  constructor(db) {
    this.#pending = db.prepare(`
      SELECT display_name, reference_url FROM reply
      WHERE status = 'pending' ORDER BY occurred_us_at DESC, id ASC
    `)
    this.#upsert = db.prepare(`
      INSERT INTO reply (source_id, status, occurred_us_at, display_name, reference_url)
      VALUES (:source_id, :status, :occurred_us_at, :display_name, :reference_url)
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

  save(reply) {
    this.#upsert.run(reply)
  }

  listPending() {
    return this.#pending.all()
  }
}
