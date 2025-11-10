import { enharmonics, UI_MESSAGES } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js';
import { playSingleNote, setVolume, getVolume } from './audio-player.js';
import { initMidiInput } from './midi-input.js';
import { setupSelectButtons, setupCheckboxListeners, updateSelectedChordCount, getSelectedChords } from './chord-selector.js';

let quizChords = [];
let currentQuestionIndex = 0;
let currentChord = null;
let correctNotes = [];
let selectedNotes = [];
let correctCount = 0;
let startTime = null;
let timerInterval = null;

/**
 * 音名の正規化（フラットをシャープに統一）
 */
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

/**
 * 選択音数の更新
 */
function updateSelectionCount() {
  const selectedCountElement = document.getElementById('selected-count');
  if (selectedCountElement) {
    selectedCountElement.textContent = selectedNotes.length;
  }
}

/**
 * 進捗バーを更新
 */
function updateProgressBar() {
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  
  if (progressBarFill && progressText) {
    const progress = ((currentQuestionIndex + 1) / 20) * 100;
    progressBarFill.style.width = `${progress}%`;
    progressText.textContent = `問題 ${currentQuestionIndex + 1} / 20`;
  }
}

/**
 * 音符のトグル
 */
function toggleNote(note, key) {
  if (!key) {
    key = document.querySelector(`#keyboard [data-note="${note}"]`) ||
      document.querySelector(`#keyboard [data-note="${enharmonics[note]}"]`);

    if (!key) {
      console.warn(`鍵盤要素が見つかりません: ${note}`);
      return;
    }
  }

  playSingleNote(note);

  const normalizedNote = normalize(note);

  if (selectedNotes.includes(normalizedNote)) {
    selectedNotes = selectedNotes.filter(n => n !== normalizedNote);
    key.classList.remove('selected');
  } else {
    selectedNotes.push(normalizedNote);
    key.classList.add('selected');
  }

  updateSelectionCount();
  
  // 選択後に自動判定
  checkAnswerAuto();
}

/**
 * MIDI入力処理
 */
let lastMidiNote = null;
let lastMidiTime = 0;

function handleMidiInput(note, isNoteOn) {
  if (isNoteOn) {
    const now = Date.now();
    if (lastMidiNote === note && (now - lastMidiTime) < 100) {
      return;
    }

    lastMidiNote = note;
    lastMidiTime = now;

    toggleNote(note, null);
  }
}

/**
 * MIDI接続状態の更新
 */
function updateMidiStatus(isConnected, message) {
  let statusElement = document.getElementById('midi-status');

  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'midi-status';
    statusElement.className = 'midi-status';

    const midiInfo = document.querySelector('.midi-info');
    if (midiInfo && midiInfo.parentNode) {
      midiInfo.parentNode.insertBefore(statusElement, midiInfo.nextSibling);
    }
  }

  statusElement.className = 'midi-status ' + (isConnected ? 'connected' : 'disconnected');
  statusElement.textContent = message;
}

/**
 * 20題のクイズを生成
 */
function generateQuiz() {
  const chords = getSelectedChords();

  if (!chords) {
    alert(UI_MESSAGES.NO_CHORDS_SELECTED);
    return false;
  }

  quizChords = [];
  for (let i = 0; i < 20; i++) {
    const randomChord = chords[Math.floor(Math.random() * chords.length)];
    quizChords.push(randomChord);
  }

  return true;
}

/**
 * クイズ開始
 */
function startQuiz() {
  if (!generateQuiz()) return;

  currentQuestionIndex = 0;
  correctCount = 0;
  startTime = Date.now();
  
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  document.getElementById('start-quiz').disabled = true;
  document.getElementById('next').disabled = false;
  document.getElementById('reset').disabled = false;
  
  updateProgressBar();
  generateQuestion();
}

/**
 * タイマー更新
 */
function updateTimer() {
  if (!startTime) return;
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * 新しい問題
 */
function generateQuestion() {
  if (currentQuestionIndex >= quizChords.length) {
    finishQuiz();
    return;
  }

  currentChord = quizChords[currentQuestionIndex];
  correctNotes = currentChord.notes;
  selectedNotes = [];

  updateProgressBar();

  const chordNameElement = document.getElementById('chord-name');
  if (chordNameElement) {
    chordNameElement.textContent = currentChord.name;
  }

  const resultElement = document.getElementById('result');
  if (resultElement) {
    resultElement.textContent = '';
    resultElement.className = '';
  }

  updateSelectionCount();

  renderKeyboard('keyboard', selectedNotes, {
    activeClass: 'selected',
    onClick: toggleNote,
    interactive: true
  });
}

/**
 * 選択をリセット
 */
function resetSelection() {
  selectedNotes = [];
  updateSelectionCount();
  
  renderKeyboard('keyboard', selectedNotes, {
    activeClass: 'selected',
    onClick: toggleNote,
    interactive: true
  });

  const resultElement = document.getElementById('result');
  if (resultElement) {
    resultElement.textContent = '';
    resultElement.className = '';
  }
}

/**
 * 自動判定（選択後に呼ばれる）
 */
function checkAnswerAuto() {
  // 選択数が正解の構成音数と一致しない場合は判定しない
  if (selectedNotes.length !== correctNotes.length) {
    return;
  }

  const normalizedSelected = selectedNotes.map(normalize).sort();
  const normalizedCorrect = correctNotes.map(normalize).sort();
  const result = document.getElementById('result');
  if (!result) return;

  const isCorrect = JSON.stringify(normalizedSelected) === JSON.stringify(normalizedCorrect);

  if (isCorrect) {
    correctCount++;
    
    result.textContent = `${UI_MESSAGES.CORRECT_PREFIX} [${currentChord.name}: ${correctNotes.join(', ')}]`;
    result.style.color = 'green';
    result.className = 'correct';

    const keyboard = document.getElementById('keyboard');
    if (keyboard) {
      keyboard.classList.add('correct-animation');
      setTimeout(() => {
        keyboard.classList.remove('correct-animation');
      }, 500);
    }

    // 正解したら1秒後に次の問題へ
    setTimeout(() => {
      currentQuestionIndex++;
      generateQuestion();
    }, 1000);
    
  } else {
    // 不正解の場合はメッセージを表示
    result.textContent = `${UI_MESSAGES.INCORRECT_PREFIX} [${currentChord.name}: ${correctNotes.join(', ')}]`;
    result.style.color = 'red';
    result.className = 'incorrect';

    const keyboard = document.getElementById('keyboard');
    if (keyboard) {
      keyboard.classList.add('incorrect-animation');
      setTimeout(() => {
        keyboard.classList.remove('incorrect-animation');
      }, 500);
    }

    // 不正解の場合は選択をリセット
    setTimeout(() => {
      resetSelection();
    }, 1000);
  }
}

/**
 * クイズ終了
 */
function finishQuiz() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const accuracy = Math.round((correctCount / 20) * 100);

  alert(`${UI_MESSAGES.QUIZ_COMPLETE}\n\n正解数: ${correctCount} / 20\n正答率: ${accuracy}%\n${UI_MESSAGES.TIME_TAKEN}${timeString}`);

  document.getElementById('start-quiz').disabled = false;
  document.getElementById('next').disabled = true;
  document.getElementById('reset').disabled = true;
  document.getElementById('result').textContent = '「クイズを開始」ボタンを押してください';
  
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  if (progressBarFill && progressText) {
    progressBarFill.style.width = '0%';
    progressText.textContent = '問題 0 / 20';
  }
}

// イベントリスナー
initMidiInput(handleMidiInput, updateMidiStatus);

document.getElementById('start-quiz').addEventListener('click', startQuiz);

document.getElementById('next').addEventListener('click', () => {
  currentQuestionIndex++;
  generateQuestion();
});

document.getElementById('reset').addEventListener('click', resetSelection);

const volumeSlider = document.getElementById('volume-slider');
if (volumeSlider) {
  volumeSlider.value = getVolume() * 100;
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    setVolume(volume);
    
    const volumeDisplay = document.getElementById('volume-display');
    if (volumeDisplay) {
      volumeDisplay.textContent = `${e.target.value}%`;
    }
  });
}

// 初期化
renderKeyboard('keyboard', [], { interactive: false });
setupSelectButtons();
setupCheckboxListeners();
updateSelectedChordCount();