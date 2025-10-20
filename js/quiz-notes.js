import { chords, enharmonics, UI_MESSAGES } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js';
import { playSingleNote } from './audio-player.js';
import { initMidiInput } from './midi-input.js';
// 【追加】共通スコア管理モジュールをインポート
import { resetScore, updateScore, renderScore } from './score-manager.js';
// 【追加】UI定数とエラーハンドラーをインポート
import { CSS_CLASSES, ELEMENT_IDS } from './ui-constants.js';
import { requireElement, validateData } from './error-handler.js';

let currentChord = "";
let correctNotes = [];
let selectedNotes = [];

function updateSelectionCount() {
  const selectedCountElement = requireElement(ELEMENT_IDS.SELECTED_COUNT);
  if (selectedCountElement) {
    selectedCountElement.textContent = selectedNotes.length;
  }
}

function normalize(note) {
  const flatToSharp = {
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#"
  };
  return flatToSharp[note] || note;
}

export function toggleNote(note, key) {
  if (!key) {
    key = document.querySelector(`#${ELEMENT_IDS.KEYBOARD} [data-note="${note}"]`) ||
      document.querySelector(`#${ELEMENT_IDS.KEYBOARD} [data-note="${enharmonics[note]}"]`);

    if (!key) {
      console.warn(`鍵盤要素が見つかりません: ${note}`);
      return;
    }
  }

  playSingleNote(note);

  const normalizedNote = normalize(note);

  if (selectedNotes.includes(normalizedNote)) {
    selectedNotes = selectedNotes.filter(n => n !== normalizedNote);
    key.classList.remove(CSS_CLASSES.SELECTED);
  } else {
    selectedNotes.push(normalizedNote);
    key.classList.add(CSS_CLASSES.SELECTED);
  }

  updateSelectionCount();
}

let lastMidiNote = null;
let lastMidiTime = 0;

function handleMidiInput(note, isNoteOn) {
  if (isNoteOn) {
    const now = Date.now();
    if (lastMidiNote === note && (now - lastMidiTime) < 50) {
      return;
    }

    lastMidiNote = note;
    lastMidiTime = now;

    toggleNote(note, null);
  }
}

function updateMidiStatus(isConnected, message) {
  let statusElement = requireElement(ELEMENT_IDS.MIDI_STATUS);

  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = ELEMENT_IDS.MIDI_STATUS;
    statusElement.className = 'midi-status';

    const midiInfo = document.querySelector('.midi-info');
    if (midiInfo && midiInfo.parentNode) {
      midiInfo.parentNode.insertBefore(statusElement, midiInfo.nextSibling);
    }
  }

  statusElement.className = 'midi-status ' + (isConnected ? 'connected' : 'disconnected');
  statusElement.textContent = message;
}

function generateQuestion() {
  if (!validateData(chords, 'コード定義')) return;

  const chordNames = Object.keys(chords);
  currentChord = chordNames[Math.floor(Math.random() * chordNames.length)];
  correctNotes = chords[currentChord];
  selectedNotes = [];

  const chordNameElement = requireElement(ELEMENT_IDS.CHORD_NAME);
  if (chordNameElement) {
    chordNameElement.textContent = currentChord;
  }

  const resultElement = requireElement(ELEMENT_IDS.RESULT);
  if (resultElement) {
    resultElement.textContent = "";
    resultElement.className = "";
  }

  updateSelectionCount();

  renderKeyboard(ELEMENT_IDS.KEYBOARD, selectedNotes, {
    activeClass: CSS_CLASSES.SELECTED,
    onClick: toggleNote
  });
}

function resetSelection() {
  selectedNotes = [];
  updateSelectionCount();
  renderKeyboard(ELEMENT_IDS.KEYBOARD, selectedNotes, {
    activeClass: CSS_CLASSES.SELECTED,
    onClick: toggleNote
  });

  const resultElement = requireElement(ELEMENT_IDS.RESULT);
  if (resultElement) {
    resultElement.textContent = "";
    resultElement.className = "";
  }
}

function checkAnswer() {
  if (selectedNotes.length === 0) {
    const result = requireElement(ELEMENT_IDS.RESULT);
    if (result) {
      result.textContent = UI_MESSAGES.NO_SELECTION;
      result.className = "";
      result.style.color = "#FF9800";
    }
    return;
  }

  const normalizedSelected = selectedNotes.map(normalize).sort();
  const normalizedCorrect = correctNotes.map(normalize).sort();
  const result = requireElement(ELEMENT_IDS.RESULT);
  if (!result) return;

  const isCorrect = JSON.stringify(normalizedSelected) === JSON.stringify(normalizedCorrect);

  // 【改善】スコア更新は共通モジュールを使用
  updateScore(isCorrect);
  renderScore();

  if (isCorrect) {
    result.textContent = `${UI_MESSAGES.CORRECT_PREFIX} [${currentChord}: ${correctNotes.join(", ")}]`;
    result.style.color = "green";
    result.className = CSS_CLASSES.CORRECT;

    const keyboard = requireElement(ELEMENT_IDS.KEYBOARD);
    if (keyboard) {
      keyboard.classList.add(CSS_CLASSES.CORRECT_ANIMATION);
      setTimeout(() => {
        keyboard.classList.remove(CSS_CLASSES.CORRECT_ANIMATION);
      }, 500);
    }
  } else {
    result.textContent = `${UI_MESSAGES.INCORRECT_PREFIX} [${currentChord}: ${correctNotes.join(", ")}]`;
    result.style.color = "red";
    result.className = CSS_CLASSES.INCORRECT;

    const keyboard = requireElement(ELEMENT_IDS.KEYBOARD);
    if (keyboard) {
      keyboard.classList.add(CSS_CLASSES.INCORRECT_ANIMATION);
      setTimeout(() => {
        keyboard.classList.remove(CSS_CLASSES.INCORRECT_ANIMATION);
      }, 500);
    }
  }
}

// 【改善】スコアリセットは共通モジュールを使用
function handleResetScore() {
  resetScore();
  renderScore();
}

initMidiInput(handleMidiInput, updateMidiStatus);

const checkButton = requireElement(ELEMENT_IDS.CHECK_BUTTON);
if (checkButton) {
  checkButton.addEventListener("click", checkAnswer);
}

const nextButton = requireElement(ELEMENT_IDS.NEXT_BUTTON);
if (nextButton) {
  nextButton.addEventListener("click", generateQuestion);
}

const resetButton = requireElement(ELEMENT_IDS.RESET_BUTTON);
if (resetButton) {
  resetButton.addEventListener("click", resetSelection);
}

const resetScoreButton = requireElement(ELEMENT_IDS.RESET_SCORE_BUTTON);
if (resetScoreButton) {
  resetScoreButton.addEventListener("click", handleResetScore);
}

renderScore();
generateQuestion();