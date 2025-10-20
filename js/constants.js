export const chords = {
  C: ["C", "E", "G"], 
  G: ["G", "B", "D"], 
  Am: ["A", "C", "E"], 
  F: ["F", "A", "C"], 
  Dm: ["D", "F", "A"], 
  Em: ["E", "G", "B"], 
  C7: ["C", "E", "G", "Bb"]
};

export const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
export const blackNotes = ["C#", "D#", "F#", "G#", "A#"];

export const blackPositions = {
  "C#": 1, 
  "D#": 2, 
  "F#": 4,
  "G#": 5,
  "A#": 6 
};

export const enharmonics = {
  "C#": "Db", "Db": "C#", 
  "D#": "Eb", "Eb": "D#", 
  "F#": "Gb", "Gb": "F#",
  "G#": "Ab", "Ab": "G#",
  "A#": "Bb", "Bb": "A#"
};

export const noteFreq = {
  "C": 261.63,  "C#": 277.18, "Db": 277.18, 
  "D": 293.66,  "D#": 311.13, "Eb": 311.13, 
  "E": 329.63,
  "F": 349.23,  "F#": 369.99, "Gb": 369.99,
  "G": 392.00,  "G#": 415.30, "Ab": 415.30,
  "A": 440.00,  "A#": 466.16, "Bb": 466.16,
  "B": 493.88 
};

// 【改善】重要な定数のみ残し、過度に細かい定数は削除
export const AUDIO_CONSTANTS = {
  CHORD_DURATION: 0.8,
  SINGLE_NOTE_DURATION: 0.2,
  CHORD_GAIN: 0.5,
  SINGLE_NOTE_GAIN: 0.4
};

// 【削除】STORAGE_KEYS - localStorage を使用しないため削除
// 【削除】DIFFICULTY_LEVELS - 現在未使用のため削除（将来必要になったら追加）

export const UI_MESSAGES = {
  NO_SELECTION: '⚠️ 音を選択してください',
  ELEMENT_NOT_FOUND: '要素が見つかりません',
  MIDI_NOT_SUPPORTED: 'Web MIDI API はこのブラウザでサポートされていません',
  MIDI_ACCESS_DENIED: 'MIDIキーボードを使用するには、ブラウザのMIDIアクセス許可が必要です',
  MIDI_CONNECTED: '🎹 MIDIキーボードが接続されました',
  MIDI_DISCONNECTED: '🎹 MIDIキーボードが切断されました',
  MIDI_READY: '🎹 MIDI対応: キーボードを接続してください',
  SELECT_CHORD: 'コードを選んでください',
  CORRECT_PREFIX: '🎉 正解！',
  INCORRECT_PREFIX: '❌ 不正解… 正解は'
};