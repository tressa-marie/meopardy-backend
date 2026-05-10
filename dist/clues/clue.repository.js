import { db } from "../db/database.js";
export function markClueAnswered(clueId) {
    const result = db.prepare(`
    UPDATE Clue
    SET isAnswered = 1
    WHERE id = ?
  `).run(clueId);
    return result.changes > 0;
}
