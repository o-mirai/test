import { noteFreq, AUDIO_CONSTANTS } from './constants.js';

let audioContext = null;
let isAudioInitialized = false;

/**
 * 【改善】非同期処理を適切に処理
 */
async function getAudioContext() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('AudioContext created successfully');
    }

    // 【改善】resume() を適切に await
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('AudioContext resumed from suspended state');
    }

    return audioContext;
  } catch (error) {
    console.error('AudioContextの作成に失敗しました:', error);
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', async () => {
    if (!isAudioInitialized) {
      await getAudioContext();
      isAudioInitialized = true;
      console.log('AudioContext initialized on first user interaction');
    }
  }, { once: true });
}

export function getFrequency(note) {
  const frequency = noteFreq[note];
  if (frequency === undefined) {
    console.warn(`未知の音名です: ${note}`);
    return 0;
  }
  return frequency;
}

/**
 * 【改善】マジックナンバーを減らし、シンプル化
 */
function playNoteWithEnvelope(note, context, duration, gain) {
  if (!context) {
    console.error('AudioContextが初期化されていません');
    return;
  }

  const frequency = getFrequency(note);
  if (frequency === 0) {
    console.error(`再生できない音名: ${note}`);
    return;
  }

  try {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    const attackTime = 0.02;
    const releaseTime = 0.1;

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(0.001, now + duration);

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    oscillator.start(now);
    oscillator.stop(now + duration + releaseTime);
  } catch (error) {
    console.error('音声の再生中にエラーが発生しました:', error);
  }
}

/**
 * 【改善】async/await で適切に処理
 */
export async function playChord(notes, duration = AUDIO_CONSTANTS.CHORD_DURATION) {
  if (!Array.isArray(notes) || notes.length === 0) {
    console.error('playChord: 音名の配列が無効です', notes);
    return;
  }

  const context = await getAudioContext();

  if (!context) {
    console.error('AudioContextの取得に失敗したため、再生できません');
    return;
  }

  notes.forEach(note => playNoteWithEnvelope(note, context, duration, AUDIO_CONSTANTS.CHORD_GAIN));
}

export async function playSingleNote(note) {
  if (typeof note !== 'string' || note.trim() === '') {
    console.error('playSingleNote: 音名が無効です', note);
    return;
  }

  const context = await getAudioContext();

  if (!context) {
    console.error('AudioContextの取得に失敗したため、再生できません');
    return;
  }

  playNoteWithEnvelope(
    note,
    context,
    AUDIO_CONSTANTS.SINGLE_NOTE_DURATION,
    AUDIO_CONSTANTS.SINGLE_NOTE_GAIN
  );
}