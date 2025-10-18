// js/keyboard-renderer.js
import { whiteNotes, blackNotes, blackPositions, enharmonics } from './constants.js';

/**
 * ノートがアクティブなノートリストに含まれているか、またはその異名同音（エンハーモニック）が含まれているかチェックする
 * @param {string} note - チェックする音名 (例: "C#")
 * @param {string[]} activeNotes - アクティブな音名の配列
 * @returns {boolean}
 */
export function isActive(note, activeNotes) {
  // 異名同音のチェックは、constants.jsでDbやEbが定義されているため不要だが、念のため維持
  return activeNotes.includes(note) || activeNotes.includes(enharmonics[note]);
}

/**
 * 鍵盤を描画する
 * @param {string} containerId - 鍵盤を配置するDOM要素のID
 * @param {string[]} activeNotes - ハイライト表示する音名の配列
 * @param {Object} options - オプション設定
 * @param {string} options.activeClass - アクティブなキーに適用するCSSクラス名 (デフォルト: "active")
 * @param {function(string, HTMLElement): void} options.onClick - キーがクリックされた時のコールバック
 */
export function renderKeyboard(containerId, activeNotes = [], options = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // 共通のCSSクラス名を設定 (デフォルトは "active")
  const activeClass = options.activeClass || "active";

  // --- 鍵盤を生成・配置するヘルパー関数 ---
  const createKey = (note, className, textContent, leftPosition) => {
    const key = document.createElement("div");
    key.className = className;
    key.textContent = textContent;
    key.style.left = leftPosition;
    
    // ★ 修正点: MIDI連携のために data-note属性を追加
    key.setAttribute('data-note', note); 

    // クリックイベントの設定を共通化
    if (options.onClick) {
      // 鍵盤がクリックされたとき、その音名と要素自身をコールバックに渡す
      key.onclick = () => options.onClick(note, key);
    }

    // アクティブクラスの設定を共通化
    if (isActive(note, activeNotes)) {
      key.classList.add(activeClass);
    }

    container.appendChild(key);
  };
  // ----------------------------------------

  // 1. 白鍵の描画
  whiteNotes.forEach((note, i) => {
    const leftPosition = `${(i * 100) / 7}%`;
    createKey(note, "white-key", note, leftPosition);
  });

  // 2. 黒鍵の描画
  blackNotes.forEach(note => {
    const leftPosition = `${(blackPositions[note] * 100) / 7}%`;
    // 黒鍵の表示を「C#/Db」のように、よりユーザーフレンドリーな形式に変更
    const noteLabel = `${note} (${enharmonics[note]})`;
    createKey(note, "black-key", noteLabel, leftPosition);
  });
}