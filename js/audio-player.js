// js/audio-player.js
import { noteFreq } from './constants.js';

// AudioContextを一度だけ生成し、再利用するための変数を設定
// ユーザー操作がないと AudioContext が動作しないブラウザがあるため、遅延初期化します。
let audioContext = null;
let isAudioInitialized = false;

/**
 * 共有の AudioContext を取得（遅延初期化）
 * ユーザーが何らかの操作（クリックなど）をした後に呼び出す必要があります。
 * @returns {AudioContext}
 */
function getAudioContext() {
  if (!audioContext) {
    // Web Audio APIの互換性対応
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // AudioContextがsuspended状態の場合、resumeする
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

// ページロード時にユーザークリックで初期化
if (typeof window !== 'undefined') {
  window.addEventListener('click', () => {
    if (!isAudioInitialized) {
      getAudioContext();
      isAudioInitialized = true;
      console.log('AudioContext initialized');
    }
  }, { once: true });
}

/**
 * 指定された音名の周波数（Hz）を取得する
 * @param {string} note - 音名 (例: "C", "G#")
 * @returns {number}
 */
export function getFrequency(note) {
  // constants.js のデータを利用
  return noteFreq[note] || 0;
}

/**
 * 単音を再生する（エンベロープ付き）
 * @param {string} note - 音名 (例: "C", "G#")
 * @param {AudioContext} context - 共有の AudioContext
 * @param {number} duration - 再生時間（秒）
 * @param {number} [gain=0.5] - 最大音量（0.0〜1.0）
 */
function playNoteWithEnvelope(note, context, duration = 0.8, gain = 0.5) { // エンベロープ処理を行う内部関数
  const frequency = getFrequency(note);
  if (frequency === 0) return; // 周波数が0の場合は再生しない

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  // 1. ノード接続: オシレーター -> ゲイン -> 出力
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  // 2. 音量エンベロープ（ADSRの簡略版: アタックとリリース）を設定
  const now = context.currentTime;

  // 初期音量を0.001に設定（クリック音防止）
  gainNode.gain.setValueAtTime(0.001, now);

  // アタック（音の立ち上がり）: 0.02秒で最大音量へ
  gainNode.gain.linearRampToValueAtTime(gain, now + 0.02); // 最大音量を引数から取得

  // リリース（音の減衰）: 指定時間（duration）かけて音量を0へ
  // 少し長く再生することで、音の途切れを防ぐ
  gainNode.gain.linearRampToValueAtTime(0.001, now + duration);

  // 3. 発振器（オシレーター）を設定
  oscillator.type = "sine"; // サイン波を使用
  oscillator.frequency.value = frequency; // 音名の周波数を設定

  // 4. 再生開始と停止
  oscillator.start(now);
  // エンベロープで音量を下げているため、停止時間は duration よりも少し長めに設定
  oscillator.stop(now + duration + 0.1);
}

/**
 * 和音を同時に再生する (クイズの問題提示用)
 * @param {string[]} notes - 音名の配列
 * @param {number} [duration=0.8] - 再生時間（秒）
 */
export function playChord(notes, duration = 0.8) {
  // 共有の AudioContext を取得（ここで初めて初期化される可能性がある）
  const context = getAudioContext();
  // 全ての音を同時に再生
  notes.forEach(note => playNoteWithEnvelope(note, context, duration)); // playNoteWithEnvelope を使用
}

/**
 * 鍵盤クリック/MIDI入力用の単音再生（短めのエンベロープ）
 * @param {string} note - 音名
 */
export function playSingleNote(note) { // playSingleNote を新規エクスポート
  const context = getAudioContext();
  // 鍵盤クリックなので、durationを短く設定（例: 0.2秒）
  playNoteWithEnvelope(note, context, 0.2, 0.4); // duration: 0.2秒, gain: 0.4で再生
}