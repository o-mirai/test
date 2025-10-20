// 必要な定数をインポート
// UI_MESSAGESもインポート（エラーメッセージの統一管理）
import { whiteNotes, blackNotes, blackPositions, enharmonics, UI_MESSAGES } from './constants.js';

/**
 * ノートがアクティブなノートリストに含まれているか、またはその異名同音（エンハーモニック）が含まれているかチェックする
 * @param {string} note - チェックする音名 (例: "C#")
 * @param {string[]} activeNotes - アクティブな音名の配列
 * @returns {boolean} - 含まれていればtrue、そうでなければfalse
 */
export function isActive(note, activeNotes) {
  // 異名同音のチェックは、constants.jsでDbやEbが定義されているため不要だが、念のため維持
  // 指定された音名が配列に含まれているか、または異名同音が含まれているかをチェック
  return activeNotes.includes(note) || activeNotes.includes(enharmonics[note]);
}

/**
 * 鍵盤を描画する
 * @param {string} containerId - 鍵盤を配置するDOM要素のID
 * @param {string[]} activeNotes - ハイライト表示する音名の配列（例：["C", "E", "G"]）
 * @param {Object} options - オプション設定
 * @param {string} options.activeClass - アクティブなキーに適用するCSSクラス名 (デフォルト: "active")
 * @param {function(string, HTMLElement): void} options.onClick - キーがクリックされた時のコールバック関数
 */
export function renderKeyboard(containerId, activeNotes = [], options = {}) {
  // エラーハンドリング: コンテナ要素の存在チェック
  const container = document.getElementById(containerId); // 鍵盤を配置するコンテナ要素を取得

  if (!container) {
    // 要素が見つからない場合のエラー処理
    const errorMsg = `${UI_MESSAGES.ELEMENT_NOT_FOUND}: #${containerId}`;
    console.error(errorMsg);
    // ユーザーに視覚的なフィードバック（オプション）
    // alert(errorMsg + '\n\nページを再読み込みしてください。');
    return; // 処理を中断
  }

  // エラーハンドリング: activeNotesの型チェック
  if (!Array.isArray(activeNotes)) {
    console.warn('activeNotesが配列ではありません。空配列として扱います。', activeNotes);
    activeNotes = []; // 配列でない場合は空配列に変換
  }

  container.innerHTML = ""; // 既存の鍵盤要素をクリア（再描画のため）

  // 共通のCSSクラス名を設定 (デフォルトは "active")
  const activeClass = options.activeClass || "active"; // オプションで指定されていればそれを使用

  // --- 鍵盤を生成・配置するヘルパー関数 ---
  const createKey = (note, className, textContent, leftPosition) => {
    // エラーハンドリング: 鍵盤作成時のエラーをキャッチ
    try {
      const key = document.createElement("div"); // div要素を作成（鍵盤1つ）
      key.className = className; // CSSクラスを設定（white-key または black-key）
      key.textContent = textContent; // 鍵盤に表示するテキスト（音名）を設定
      key.style.left = leftPosition; // 鍵盤の左端位置を設定（%で指定）

      //  MIDI連携のために data-note属性を追加
      key.setAttribute('data-note', note); // 音名をdata属性として保存（MIDI入力時の検索に使用）

      // アクセシビリティ対応: キーボード操作のサポート
      key.setAttribute('tabindex', '0'); // Tabキーで選択可能にする
      key.setAttribute('role', 'button'); // スクリーンリーダーにボタンとして認識させる
      key.setAttribute('aria-label', `${note}の鍵盤`); // スクリーンリーダー用の説明

      // クリックイベントの設定を共通化
      if (options.onClick) { // onClickコールバックが指定されている場合
        // 鍵盤がクリックされたとき、その音名と要素自身をコールバックに渡す
        key.onclick = () => options.onClick(note, key);

        // アクセシビリティ対応: キーボード操作（EnterキーとSpaceキー）
        key.addEventListener('keydown', (event) => {
          // EnterキーまたはSpaceキーが押された場合
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); // デフォルトのスクロール動作を防止
            options.onClick(note, key); // クリックと同じ処理を実行
          }
        });
      }

      // アクティブクラスの設定を共通化
      if (isActive(note, activeNotes)) { // この音名がアクティブリストに含まれる場合
        key.classList.add(activeClass); // アクティブ用のCSSクラスを追加（ハイライト表示）
      }

      container.appendChild(key); // コンテナに鍵盤要素を追加
    } catch (error) {
      // エラーハンドリング: 鍵盤作成時のエラーをログに記録
      console.error(`鍵盤の作成中にエラーが発生しました (note: ${note}):`, error);
    }
  };

  // エラーハンドリング: 鍵盤描画処理全体をtry-catchで囲む
  try {
    // 1. 白鍵の描画
    whiteNotes.forEach((note, i) => { // 白鍵の配列をループ（C, D, E, F, G, A, B）
      const leftPosition = `${(i * 100) / 7}%`; // 左端位置を計算（7つの白鍵を均等配置）
      createKey(note, "white-key", note, leftPosition); // 白鍵を作成
    });

    // 2. 黒鍵の描画
    blackNotes.forEach(note => { // 黒鍵の配列をループ（C#, D#, F#, G#, A#）
      const leftPosition = `${(blackPositions[note] * 100) / 7}%`; // 黒鍵の位置を計算
      // 黒鍵の表示を「C#/Db」のように、よりユーザーフレンドリーな形式に変更
      const noteLabel = `${note} (${enharmonics[note]})`; // 表示テキストを作成（シャープとフラット両方）
      createKey(note, "black-key", noteLabel, leftPosition); // 黒鍵を作成
    });
  } catch (error) {
    // エラーハンドリング: 鍵盤描画全体のエラーをキャッチ
    console.error('鍵盤の描画中に予期しないエラーが発生しました:', error);
    // ユーザーへのフィードバック（オプション）
    if (container) {
      container.innerHTML = '<p style="color: red; padding: 20px;">鍵盤の表示に失敗しました。ページを再読み込みしてください。</p>';
    }
  }
}