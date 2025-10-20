import { chords, UI_MESSAGES } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js';
import { playChord } from './audio-player.js';
// 【追加】共通スコア管理モジュールをインポート
import { resetScore, updateScore, renderScore } from './score-manager.js';
// 【追加】UI定数とエラーハンドラーをインポート
import { CSS_CLASSES, ELEMENT_IDS, SELECTORS } from './ui-constants.js';
import { requireElement, validateData } from './error-handler.js';

let currentChord = "";
let answered = false;

function newQuestion(autoPlay = true) {
  if (!validateData(chords, 'コード定義')) return;

  const chordNames = Object.keys(chords);
  currentChord = chordNames[Math.floor(Math.random() * chordNames.length)];

  renderKeyboard(ELEMENT_IDS.KEYBOARD, chords[currentChord]);

  if (autoPlay) {
    playChord(chords[currentChord]);
  }

  const result = requireElement(ELEMENT_IDS.RESULT);
  if (!result) return;

  result.textContent = UI_MESSAGES.SELECT_CHORD;
  result.style.color = "black";
  result.className = "";

  document.querySelectorAll(SELECTORS.CHOICES).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.CORRECT, CSS_CLASSES.INCORRECT);
    btn.disabled = false;
  });

  answered = false;
}

function replayChord() {
  if (!currentChord || !chords[currentChord]) {
    console.error('再生するコードが見つかりません');
    return;
  }

  playChord(chords[currentChord]);

  const keyboard = requireElement(ELEMENT_IDS.KEYBOARD);
  if (keyboard) {
    keyboard.classList.add(CSS_CLASSES.CORRECT_ANIMATION);
    setTimeout(() => {
      keyboard.classList.remove(CSS_CLASSES.CORRECT_ANIMATION);
    }, 500);
  }
}

// 【改善】スコアリセットは共通モジュールを使用
function handleResetScore() {
  resetScore();
  renderScore();
}

document.querySelectorAll(SELECTORS.CHOICES).forEach(btn => {
  btn.addEventListener("click", () => {
    if (answered) return;

    const answer = btn.textContent;
    const result = requireElement(ELEMENT_IDS.RESULT);
    if (!result) return;

    answered = true;
    const isCorrect = answer === currentChord;

    // 【改善】スコア更新は共通モジュールを使用
    updateScore(isCorrect);
    renderScore();

    if (isCorrect) {
      result.textContent = `${UI_MESSAGES.CORRECT_PREFIX} [${currentChord}: ${chords[currentChord].join(", ")}]`;
      result.style.color = "green";
      result.className = CSS_CLASSES.CORRECT;
      btn.classList.add(CSS_CLASSES.CORRECT);

      playChord(chords[currentChord]);

      document.querySelectorAll(SELECTORS.CHOICES).forEach(b => {
        b.disabled = true;
      });
    } else {
      result.textContent = `${UI_MESSAGES.INCORRECT_PREFIX} [${currentChord}: ${chords[currentChord].join(", ")}]`;
      result.style.color = "red";
      result.className = CSS_CLASSES.INCORRECT;
      btn.classList.add(CSS_CLASSES.INCORRECT);

      document.querySelectorAll(SELECTORS.CHOICES).forEach(b => {
        if (b.textContent === currentChord) {
          b.classList.add(CSS_CLASSES.CORRECT);
        }
        b.disabled = true;
      });
    }
  });
});

const nextButton = requireElement(ELEMENT_IDS.NEXT_BUTTON);
if (nextButton) {
  nextButton.addEventListener("click", () => newQuestion(true));
}

const replayButton = requireElement(ELEMENT_IDS.REPLAY_BUTTON);
if (replayButton) {
  replayButton.addEventListener("click", replayChord);
}

const resetScoreButton = requireElement(ELEMENT_IDS.RESET_SCORE_BUTTON);
if (resetScoreButton) {
  resetScoreButton.addEventListener("click", handleResetScore);
}

renderScore();
newQuestion(false);