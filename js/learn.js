import { chords } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js';
import { playChord } from './audio-player.js';

document.querySelectorAll(".chord-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    const chord = btn.dataset.chord;
    const notes = chords[chord];
    document.getElementById("chord-name").textContent = `コード：${chord}`;
    document.getElementById("chord-notes").textContent = `構成音：${notes.join(", ")}`;
    renderKeyboard("keyboard", notes);
    playChord(notes);
  });
});

renderKeyboard("keyboard");
