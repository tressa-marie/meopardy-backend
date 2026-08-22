export function gameRoom(gameId) {
    return `game:${gameId}`;
}
export function adminRoom(gameId) {
    return `game:${gameId}:admin`;
}
export function playerRoom(gameId) {
    return `game:${gameId}:players`;
}
