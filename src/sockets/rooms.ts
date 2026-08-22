export function gameRoom(gameId: number) {
  return `game:${gameId}`;
}

export function adminRoom(gameId: number) {
  return `game:${gameId}:admin`;
}

export function playerRoom(gameId: number) {
  return `game:${gameId}:players`;
}
