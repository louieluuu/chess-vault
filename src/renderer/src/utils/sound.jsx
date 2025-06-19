// Imports
import { Howl } from 'howler'

import booked from '../assets/sound/booked.mp3'
import capture from '../assets/sound/capture.mp3'
import correct from '../assets/sound/correct.mp3'
import incorrect from '../assets/sound/incorrect.mp3'
import moveBlack from '../assets/sound/moveBlack.mp3'
import moveWhite from '../assets/sound/moveWhite.mp3'
import nextVariation from '../assets/sound/nextVariation.mp3'
import saveVariation from '../assets/sound/saveVariation.mp3'
import startStudy from '../assets/sound/startStudy.mp3'

// Howls
const soundBooked = new Howl({ src: [booked] })
const soundCapture = new Howl({ src: [capture] })
const soundCorrect = new Howl({ src: [correct] })
const soundIncorrect = new Howl({ src: [incorrect] })
const soundMoveBlack = new Howl({ src: [moveBlack] })
const soundMoveWhite = new Howl({ src: [moveWhite] })
const soundNextVariation = new Howl({ src: [nextVariation] })
const soundSaveVariation = new Howl({ src: [saveVariation] })
const soundStartStudy = new Howl({ src: [startStudy] })

const sounds = {
  booked: soundBooked,
  capture: soundCapture,
  correct: soundCorrect,
  incorrect: soundIncorrect,
  moveBlack: soundMoveBlack,
  moveWhite: soundMoveWhite,
  nextVariation: soundNextVariation,
  saveVariation: soundSaveVariation,
  startStudy: soundStartStudy
}

// Functions
function playSound(howl) {
  howl.play()
}

function playSoundMove(move) {
  if (move.captured) {
    playSound(sounds.capture)
    return
  }

  playSound(move.color === 'w' ? sounds.moveWhite : sounds.moveBlack)
}

export { playSound, playSoundMove, sounds }
