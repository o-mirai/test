export const chords = {
  C: ["C", "E", "G"],
  G: ["G", "B", "D"],
  Am: ["A", "C", "E"],
  F: ["F", "A", "C"],
  Dm: ["D", "F", "A"],
  Em: ["E", "G", "B"],
  // --------------------------------------------------------
  C7: ["C", "E", "G", "Bb"]
};

export const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
export const blackNotes = ["C#", "D#", "F#", "G#", "A#"];

// 鍵盤描画用の黒鍵の相対位置
export const blackPositions = {
  "C#": 1, "D#": 2, "F#": 4, "G#": 5, "A#": 6
};

// 異名同音の正規化（DbとC#、EbとD#など）のためのマッピング
export const enharmonics = {
  "C#": "Db", "Db": "C#",
  "D#": "Eb", "Eb": "D#",
  "F#": "Gb", "Gb": "F#",
  "G#": "Ab", "Ab": "G#",
  "A#": "Bb", "Bb": "A#"
};

// 周波数データ（A4=440Hz基準）
export const noteFreq = {
  "C": 261.63, "C#": 277.18, "Db": 277.18,
  "D": 293.66, "D#": 311.13, "Eb": 311.13,
  "E": 329.63, "F": 349.23, "F#": 369.99, "Gb": 369.99,
  "G": 392.00, "G#": 415.30, "Ab": 415.30,
  "A": 440.00, "A#": 466.16, "Bb": 466.16,
  "B": 493.88
};