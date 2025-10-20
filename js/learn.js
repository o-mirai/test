// 必要なモジュールをインポート
import { chords } from './constants.js'; // コード定義をインポート
import { renderKeyboard } from './keyboard-renderer.js'; // 鍵盤描画関数をインポート
import { playChord } from './audio-player.js'; // コード再生関数をインポート

// 全てのコードボタンにイベントリスナーを設定
document.querySelectorAll(".chord-buttons button").forEach(btn => { // 各ボタンに対して
  btn.addEventListener("click", () => { // クリックイベントを登録
    const chord = btn.dataset.chord; // data-chord属性からコード名を取得（例："C", "Dm"）
    const notes = chords[chord]; // コード名から構成音の配列を取得（例：["C", "E", "G"]）

    // コード名を表示
    document.getElementById("chord-name").textContent = `コード：${chord}`; // 「コード：C」のように表示

    // 構成音を表示
    document.getElementById("chord-notes").textContent = `構成音：${notes.join(", ")}`; // 「構成音：C, E, G」のように表示

    // 鍵盤を描画（選択されたコードの構成音をハイライト）
    renderKeyboard("keyboard", notes); // 構成音の鍵盤を黄色にハイライト

    // コードを再生
    playChord(notes); // 構成音を同時に鳴らす
  });
});

// ページ読み込み時に空の鍵盤を描画（何もハイライトされていない状態）
renderKeyboard("keyboard"); // 初期状態の鍵盤を表示