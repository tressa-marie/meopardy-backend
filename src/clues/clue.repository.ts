import { db } from "../db/database.js";

export function markClueAnswered(clueId: number) {
  const result = db.prepare<[number]>(`
    UPDATE Clue
    SET isAnswered = 1
    WHERE id = ?
  `).run(clueId);

  return result.changes > 0;
}
