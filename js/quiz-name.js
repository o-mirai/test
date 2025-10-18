import { chords } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js';
import { playChord } from './audio-player.js';

let currentChord = "";

/**
 * 新しい問題を生成し、鍵盤を描画・演奏する
 */
function newQuestion() {
  const chordNames = Object.keys(chords);
  currentChord = chordNames[Math.floor(Math.random() * chordNames.length)];

  // 鍵盤を描画 (activeClassはデフォルトの'active'を使用)
  renderKeyboard("keyboard", chords[currentChord]);

  // コードを演奏
  playChord(chords[currentChord]);

  // 結果表示をリセット
  const result = document.getElementById("result");
  result.textContent = "コードを選んでください";
  result.style.color = "black"; // 色もリセット
}

// 回答ボタンのイベントリスナー
document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    const answer = btn.textContent;
    const result = document.getElementById("result");

    if (answer === currentChord) {
      // ✅ 正解の場合: 結果を表示し、もう一度コードを鳴らす
      result.textContent = `🎉 正解！ [${currentChord}: ${chords[currentChord].join(", ")}]`;
      result.style.color = "green";
      playChord(chords[currentChord]);
    } else {
      // ❌ 不正解の場合: 結果を表示し、鍵盤のハイライトを一時的に解除してリセットを促す
      result.textContent = `❌ 不正解… 正解は [${currentChord}: ${chords[currentChord].join(", ")}]`;
      result.style.color = "red";
      // 不正解の場合は、答えが分かったので次の問題へ進むことを促す
      // 鍵盤はそのままにしておくことで、どの音が鳴っていたか確認できる
    }
  });
});

document.getElementById("next").addEventListener("click", newQuestion);

// 最初の問題を生成
newQuestion();