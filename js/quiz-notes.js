// js/quiz-notes.js
import { chords, enharmonics } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js'; // 鍵盤描画モジュール
import { playSingleNote } from './audio-player.js';     //  単音再生モジュールをインポート
import { initMidiInput } from './midi-input.js';        // MIDI入力モジュールをインポート

let currentChord = "";
let correctNotes = [];
let selectedNotes = [];

/**
 * 異名同音（シャープとフラット）を正規化し、比較を容易にする
 * - すべてのフラット音をシャープ音に統一する（例: "Bb" -> "A#", "Db" -> "C#"）
 * @param {string} note - 音名 (例: "C#", "Db")
 * @returns {string} - 正規化された音名 (例: "Db" -> "C#", "A#" -> "A#")
 */
function normalize(note) {
  // フラット音からシャープ音へのマッピング
  const flatToSharp = {
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#"
  };
  // マッピングにあればシャープに変換し、なければそのままの音名（白鍵やシャープ音）を返す
  return flatToSharp[note] || note;
}

/**
 * 鍵盤のクリック（または MIDI 入力）時に、選択状態をトグルし、音を鳴らす
 * @param {string} note - クリックされた音名 (例: "C", "C#")
 * @param {HTMLElement | null} key - クリックされた鍵盤要素。MIDIからの場合はnull。
 */
export function toggleNote(note, key) { // MIDI連携のためにexport
  console.log(`toggleNote called: note=${note}, key=${key ? 'exists' : 'null'}`); // デバッグログ
  
  // MIDI入力の場合はkey要素がないため、ここで要素を取得
  if (!key) {
    // 画面上の鍵盤要素を音名から特定するロジック（data-note 属性を使う）
    // key = document.querySelector(`#keyboard [data-note="${note}"]`);
    // 異名同音の鍵盤を考慮して、両方を探すロジックを追加
    key = document.querySelector(`#keyboard [data-note="${note}"]`) || 
          document.querySelector(`#keyboard [data-note="${enharmonics[note]}"]`);

    if (!key) {
      console.warn(`鍵盤要素が見つかりません: ${note}`); // デバッグログ
      return; // 要素が見つからない場合は処理を終了
    }
  }
  
  // 鍵盤をクリック/MIDI入力した際に音を鳴らす (音を鳴らすのは一度で良い)
  playSingleNote(note); // playSingleNoteを使って音を鳴らす
  
  // 正規化して選択状態を管理（MIDIから来た音名も正規化）
  const normalizedNote = normalize(note);
  
  // 選択ロジック
  if (selectedNotes.includes(normalizedNote)) {
    selectedNotes = selectedNotes.filter(n => n !== normalizedNote);
    key.classList.remove("selected");
    console.log(`Deselected: ${normalizedNote}`); // デバッグログ
  } else {
    selectedNotes.push(normalizedNote);
    key.classList.add("selected");
    console.log(`Selected: ${normalizedNote}`); // デバッグログ
  }
  
  console.log(`Current selected notes:`, selectedNotes); // デバッグログ
}

/**
 * MIDIキーボードからの入力イベントを処理するハンドラ
 * Note Off (離された) のイベントは、選択状態のトグルには使わないため無視します。
 * @param {string} note - 音名 (例: "C", "C#")
 * @param {boolean} isNoteOn - Note On (true) または Note Off (false)
 */
let lastMidiNote = null; // 最後に処理したMIDI音を記録
let lastMidiTime = 0;    // 最後に処理した時刻

function handleMidiInput(note, isNoteOn) { // ★ 新規定義: MIDI入力ハンドラ
    console.log(`handleMidiInput called: note=${note}, isNoteOn=${isNoteOn}`); // デバッグログ追加
    
    if (isNoteOn) {
        // 同じ音が短時間（50ms以内）に2回来た場合は無視（重複防止）
        const now = Date.now();
        if (lastMidiNote === note && (now - lastMidiTime) < 50) {
            console.log(`Duplicate MIDI event ignored: ${note}`); // デバッグログ
            return;
        }
        
        lastMidiNote = note;
        lastMidiTime = now;
        
        // MIDIのNote Onイベントを、画面の鍵盤クリックと同じように扱う
        // key要素はnullとして渡し、toggleNote内でDOMを探させる
        toggleNote(note, null); 
    }
}

/**
 * 新しい問題を生成し、鍵盤を描画する
 */
function generateQuestion() {
  const chordNames = Object.keys(chords);
  currentChord = chordNames[Math.floor(Math.random() * chordNames.length)];
  correctNotes = chords[currentChord];
  selectedNotes = [];

  document.getElementById("chord-name").textContent = currentChord;
  document.getElementById("result").textContent = "";

  // 共通モジュール (keyboard-renderer.js) を使用して鍵盤を描画
  renderKeyboard("keyboard", selectedNotes, {
    activeClass: "selected", // 選択状態を示すCSSクラス
    onClick: toggleNote       // クリック時のコールバック関数
  });
}

/**
 * ユーザーの回答をチェックし、結果を表示する
 */
function checkAnswer() {
  // 選択された音と正解の音を正規化し、ソートして比較
  const normalizedSelected = selectedNotes.map(normalize).sort();
  const normalizedCorrect = correctNotes.map(normalize).sort();
  const result = document.getElementById("result");

  console.log('Selected (normalized):', normalizedSelected); // デバッグログ
  console.log('Correct (normalized):', normalizedCorrect);   // デバッグログ

  // 配列を文字列化して比較することで、要素と順序が完全に一致するかを判定
  if (JSON.stringify(normalizedSelected) === JSON.stringify(normalizedCorrect)) {
    result.textContent = `🎉 正解！ [${currentChord}: ${correctNotes.join(", ")}]`;
    result.style.color = "green";
  } else {
    result.textContent = `❌ 不正解… 正解は [${currentChord}: ${correctNotes.join(", ")}]`;
    result.style.color = "red";
  }
}

// ----------------------------------------------------
// 初期化とイベントリスナーの登録
// ----------------------------------------------------

// ページロード時にMIDI入力を初期化
console.log('MIDI初期化開始'); // デバッグログ
initMidiInput(handleMidiInput); //  MIDI初期化の呼び出しを追加

document.getElementById("check").addEventListener("click", checkAnswer);
document.getElementById("next").addEventListener("click", generateQuestion);

// 画面ロード時に最初の問題を生成
generateQuestion();