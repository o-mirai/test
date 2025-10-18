const noteMap = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

/**
 * MIDIノートナンバーを音名（例: "C", "C#"）に変換する（オクターブ情報なし）
 * @param {number} noteNumber - MIDIノートナンバー (例: 60 = C4)
 * @returns {string} - オクターブなしの音名 (例: "C")
 */
function noteNumberToNoteName(noteNumber) {
  // 12で割った余りが noteMap のインデックスになる
  const noteIndex = noteNumber % 12;
  return noteMap[noteIndex];
}

/**
 * MIDI入力を初期化し、コールバック関数にNote On/Offイベントを渡す
 * @param {function(string, boolean): void} callback - MIDIイベント発生時に呼び出すコールバック
 */
export function initMidiInput(callback) {
  console.log('initMidiInput called'); // デバッグログ追加
  
  // Web MIDI API がサポートされているかチェック
  if (!navigator.requestMIDIAccess) {
    console.warn("Web MIDI API はこのブラウザでサポートされていません。");
    return;
  }

  // MIDIアクセスを要求
  navigator.requestMIDIAccess()
    .then(midiAccess => {
      console.log("MIDIアクセスが許可されました。入力ポートを監視します...");
      // 入力ポートを全て取得
      const inputs = midiAccess.inputs.values();

      for (let input of inputs) {
        console.log(`MIDI入力デバイスを検出: ${input.name}`);
        // 全ての入力ポートでメッセージをリッスン
        input.onmidimessage = (message) => {
          console.log(`Message from ${input.name}`); // デバッグログ追加
          handleMidiMessage(message, callback);
        };
      }
      
      // デバイスの接続/切断イベントも監視
      midiAccess.onstatechange = (event) => {
        console.log(`MIDIデバイスの状態が変更されました: ${event.port.name}, ${event.port.state}`);
      };

    })
    .catch(error => {
      // ユーザーが許可しなかった場合やエラー発生時の処理
      console.error(`MIDIアクセスに失敗しました: ${error}`);
      alert("MIDIキーボードを使用するには、ブラウザのMIDIアクセス許可が必要です。");
    });
}

/**
 * MIDIメッセージを処理し、コールバック関数を実行する
 */
function handleMidiMessage(message, callback) {
  const [command, noteNumber, velocity] = message.data;
  
  // タイミングメッセージ（MIDI Clock, Active Sensingなど）を除外
  // 0xF8 = 248 (MIDI Clock), 0xFE = 254 (Active Sensing)
  if (command >= 0xF0) {
    // システムメッセージは無視（ログも出さない）
    return;
  }
  
  console.log(`MIDI message: command=${command}, note=${noteNumber}, velocity=${velocity}`); // デバッグログ追加

  // Note On (command 144-159) または Note Off (command 128-143) かどうかを判断
  // velocityが0のNote Onメッセージ (0x90) はNote Offとして扱われる
  const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
  const isNoteOff = (command & 0xf0) === 0x80 || ((command & 0xf0) === 0x90 && velocity === 0);

  if (isNoteOn || isNoteOff) {
    const noteName = noteNumberToNoteName(noteNumber);
    console.log(`MIDI event: ${noteName} ${isNoteOn ? 'ON' : 'OFF'}`); // デバッグログ追加
    // callback(音名, isNoteOn) を実行
    callback(noteName, isNoteOn);
  }
}