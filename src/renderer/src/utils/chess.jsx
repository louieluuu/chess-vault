// Constants
export const NUM_AUTO_MOVES_WHITE = 2
export const NUM_AUTO_MOVES_BLACK = 3

/**
 * Transforms a PGN to an array of moves
 *
 * @param pgn - "1. e4 e5 2. d4 d5 ..."
 * @returns - ["e4", "e5", "d4", "d5", ...]
 */
export function pgnToMovesArray(pgn) {
  const pgnMoves = []
  const parts = pgn.split(' ')
  parts.forEach((part) => {
    if (part.includes('.')) {
      return
    }
    pgnMoves.push(part)
  })
  return pgnMoves
}
