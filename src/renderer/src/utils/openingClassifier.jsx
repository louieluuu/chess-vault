import openings from '../data/openings.json'

// Constants
export const STARTING_POSITION = 'Starting Position'

const sortedOpeningsByLongest = []
openings.forEach((opening) => {
  if (opening.pgn && typeof opening.pgn === 'string') {
    sortedOpeningsByLongest.push({
      eco: opening.eco,
      name: opening.name,
      pgn: opening.pgn
    })
  }
})

// Sort the openings by the length of their *cleaned* move sequence in descending order.
// This allows us to find the *longest* (most specific) match first when iterating.
// We clean it once here to avoid doing it repeatedly in classifyOpening.
sortedOpeningsByLongest.sort((a, b) => {
  const cleanedAMoves = a.pgn
    .replace(/\d+\.\s?/g, '')
    .replace(/\.\.\./g, '')
    .trim()
  const cleanedBMoves = b.pgn
    .replace(/\d+\.\s?/g, '')
    .replace(/\.\.\./g, '')
    .trim()
  return cleanedBMoves.length - cleanedAMoves.length
})

/**
 * Classifies a chess opening from a PGN's move history by finding the longest matching move sequence.
 * This effectively implements the "most specific opening" concept.
 *
 * @param {Array<string>} sanMovesArray - An array of Standard Algebraic Notation (SAN) moves (e.g., ['e4', 'e5', 'Nf3']).
 * @returns {object} An object with { name, eco_code, variation } for the identified opening,
 * or a default if no match is found.
 */
export function classifyOpening(sanMovesArray) {
  if (!sanMovesArray || sanMovesArray.length === 0) {
    return { name: STARTING_POSITION, eco_code: '', variation: '' }
  }

  // The full history of moves from the live board (e.g., "e4 e5 Nf3 Nc6")
  const sanMovesString = sanMovesArray.join(' ')
  let bestOpeningMatch = { name: 'Unknown Opening', eco_code: '', variation: '' }

  // Iterate through our sorted openings (longest move sequence first)
  // to find the most specific match.
  for (const opening of sortedOpeningsByLongest) {
    // The `opening.moves` here is the PGN string from your `openings.json` (e.g., "1. e4 e5 2. Nf3 Nc6").
    // We need to clean this PGN string to match the format of `sanMovesString` (just SAN moves, no numbers).
    const cleanedOpeningMoves = opening.pgn
      .replace(/\d+\.\s?/g, '')
      .replace(/\.\.\./g, '')
      .trim()

    // Check if the full game history starts with this cleaned opening's move sequence
    if (sanMovesString.startsWith(cleanedOpeningMoves)) {
      // Because we sorted by length descending, the first match we find
      // will be the longest and thus the most specific one.
      bestOpeningMatch = {
        name: opening.name || 'Unknown Opening',
        eco: opening.eco || '',
        pgn: opening.pgn
      }
      break // Found the best match, no need to check shorter ones
    }
  }

  return bestOpeningMatch
}
