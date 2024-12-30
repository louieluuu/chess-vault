// Constants
const DESCS = ['again', 'hard', 'good', 'easy']
const HOUR = 60
const STEPS = [1 * HOUR, 4 * HOUR, 8 * HOUR]
const GRADUATING_INTERVAL = 12 * HOUR
const MIN_EASE = 1.3

export const NUM_AUTO_MOVES_WHITE = 2
export const NUM_AUTO_MOVES_BLACK = 3

// Classes
export class Card {
  constructor(status, interval, ease = 2.5, step = 0) {
    this.status = status
    this.interval = interval
    this.ease = Math.max(MIN_EASE, ease)
    this.step = step
  }

  /**
   * Calculate options
   *
   * References:
   * https://docs.ankiweb.net/deck-options.html#learning-steps
   * https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html
   * https://github.com/vlopezferrando/simple-spaced-repetition/blob/main/simple_spaced_repetition.py
   *
   * @returns - Object of Cards representing the intervals for "Again", "Hard", "Good", and "Easy"
   */
  calculateOptions() {
    let options = []

    if (this.status === 'learning') {
      options = [
        new Card('learning', STEPS[0], this.ease, 0),
        new Card('learning', STEPS[this.step], this.ease, this.step),

        this.step + 1 < STEPS.length
          ? new Card('learning', STEPS[this.step + 1], this.ease, this.step + 1)
          : new Card('reviewing', GRADUATING_INTERVAL, this.ease),

        new Card('reviewing', GRADUATING_INTERVAL, this.ease)
      ]
    } else if (this.status === 'reviewing') {
      options = [
        new Card('learning', STEPS[0], this.ease - 0.2),
        new Card('reviewing', this.interval * 1.2, this.ease - 0.15),
        new Card('reviewing', this.interval * this.ease, this.ease),
        new Card('reviewing', this.interval * this.ease * 1.5, this.ease + 0.15)
      ]
    }

    let ret = []

    DESCS.forEach((_, i) => {
      ret.push({ desc: DESCS[i], card: options[i] })
    })

    console.log(`calculateOptions returns: ${JSON.stringify(ret, null, 2)}`)

    return ret
  }
}

/**
 * Transform a PGN to an array of moves
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
