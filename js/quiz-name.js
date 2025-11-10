import { UI_MESSAGES } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js';
import { playChord, setVolume, getVolume, setAutoPlay, isAutoPlayEnabled } from './audio-player.js';
import { setupSelectButtons, setupCheckboxListeners, updateSelectedChordCount, getSelectedChords } from './chord-selector.js';

let quizChords = [];
let currentQuestionIndex = 0;
let currentChord = null;
let correctCount = 0;
let answered = false;
let startTime = null;
let timerInterval = null;

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
  document.getElementById('replay').disabled = false;
  
  updateChoices();
  updateProgressBar();
  newQuestion(isAutoPlayEnabled());
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
 * 選択肢を更新
 */
function updateChoices() {
  const choicesContainer = document.getElementById('choices');
  if (!choicesContainer) return;

  choicesContainer.innerHTML = '';

  const uniqueChordNames = [...new Set(quizChords.map(c => c.name))];

  uniqueChordNames.forEach(chordName => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.textContent = chordName;
    button.addEventListener('click', () => handleAnswer(chordName, button));
    choicesContainer.appendChild(button);
  });
}

/**
 * 新しい問題
 */
function newQuestion(autoPlay = true) {
  if (currentQuestionIndex >= quizChords.length) {
    finishQuiz();
    return;
  }

  currentChord = quizChords[currentQuestionIndex];
  answered = false;

  updateProgressBar();

  renderKeyboard('keyboard', currentChord.notes, {
    activeClass: 'active',
    interactive: false
  });

  if (autoPlay && isAutoPlayEnabled()) {
    playChord(currentChord.notes);
  }

  const result = document.getElementById('result');
  if (result) {
    result.textContent = UI_MESSAGES.SELECT_CHORD;
    result.style.color = 'black';
    result.className = '';
  }

  document.querySelectorAll('.choice').forEach(btn => {
    btn.classList.remove('correct', 'incorrect');
    btn.disabled = false;
  });
}

/**
 * 回答処理
 */
function handleAnswer(answer, button) {
  if (answered) return;

  answered = true;
  const result = document.getElementById('result');
  if (!result) return;

  const isCorrect = answer === currentChord.name;

  if (isCorrect) {
    correctCount++;
    
    result.textContent = `${UI_MESSAGES.CORRECT_PREFIX} [${currentChord.name}: ${currentChord.notes.join(', ')}]`;
    result.style.color = 'green';
    result.className = 'correct';
    button.classList.add('correct');

    playChord(currentChord.notes);

    setTimeout(() => {
      currentQuestionIndex++;
      newQuestion(isAutoPlayEnabled());
    }, 1000);
    
  } else {
    result.textContent = `${UI_MESSAGES.INCORRECT_PREFIX} [${currentChord.name}: ${currentChord.notes.join(', ')}]`;
    result.style.color = 'red';
    result.className = 'incorrect';
    button.classList.add('incorrect');

    document.querySelectorAll('.choice').forEach(b => {
      if (b.textContent === currentChord.name) {
        b.classList.add('correct');
      }
    });
  }

  document.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
  });
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
  document.getElementById('replay').disabled = true;
  document.getElementById('result').textContent = '「クイズを開始」ボタンを押してください';
  
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  if (progressBarFill && progressText) {
    progressBarFill.style.width = '0%';
    progressText.textContent = '問題 0 / 20';
  }
}

/**
 * もう一度聴く
 */
function replayChord() {
  if (!currentChord) return;
  playChord(currentChord.notes);
}

// イベントリスナー
document.getElementById('start-quiz').addEventListener('click', startQuiz);

document.getElementById('next').addEventListener('click', () => {
  currentQuestionIndex++;
  newQuestion(isAutoPlayEnabled());
});

document.getElementById('replay').addEventListener('click', replayChord);

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

const autoPlayCheckbox = document.getElementById('auto-play-checkbox');
if (autoPlayCheckbox) {
  autoPlayCheckbox.checked = isAutoPlayEnabled();
  autoPlayCheckbox.addEventListener('change', (e) => {
    setAutoPlay(e.target.checked);
  });
}

renderKeyboard('keyboard', [], { interactive: false });
setupSelectButtons();
setupCheckboxListeners();
updateSelectedChordCount();