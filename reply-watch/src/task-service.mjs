import { TaskStore } from './task-store.mjs'

export class TaskService {
  #store

  constructor(db) {
    this.#store = new TaskStore(db)
  }

  markPending({ source_id, occurred_us_at, display_name, reference_url }) {
    this.#store.save({ source_id, status: 'pending', occurred_us_at, display_name, reference_url })
  }

  markDone({ source_id, occurred_us_at }) {
    this.#store.save({ source_id, status: 'done', occurred_us_at, display_name: null, reference_url: null })
  }
}
