import { generateChordNotes, generateChordName } from './constants.js';
import { renderKeyboard } from './keyboard-renderer.js';
import { playChord, setVolume, getVolume } from './audio-player.js';
import { setupSelectButtons, setupCheckboxListeners, updateSelectedChordCount, getSelectedChords } from './chord-selector.js';

let selectedChords = [];

/**
 * 選択を反映してコードボタンを生成
 */
function applySelection() {
  const chords = getSelectedChords();

  if (!chords) {
    alert('⚠️ ルート音とコードの種類を1つ以上選択してください');
    return;
  }

  selectedChords = chords;
  updateChordButtons();
  
  alert(`✓ ${selectedChords.length}個のコードを選択しました`);
}

/**
 * コードボタンを更新
 */
function updateChordButtons() {
  const container = document.getElementById('chord-buttons');
  if (!container) return;

  container.innerHTML = '';

  selectedChords.forEach(chord => {
    const button = document.createElement('button');
    button.textContent = chord.name;
    button.addEventListener('click', () => {
      document.getElementById('chord-name').textContent = `コード：${chord.name}`;
      document.getElementById('chord-notes').textContent = `構成音：${chord.notes.join(', ')}`;

      renderKeyboard('keyboard', chord.notes, {
        activeClass: 'active',
        interactive: false
      });

      playChord(chord.notes);
    });
    container.appendChild(button);
  });
}

/**
 * 音量変更時のフィードバック
 */
function handleVolumeChange(volume) {
  setVolume(volume);
  playChord(['C', 'E', 'G']);
}

// イベントリスナー設定
document.getElementById('apply-selection').addEventListener('click', applySelection);

const volumeSlider = document.getElementById('volume-slider');
if (volumeSlider) {
  volumeSlider.value = getVolume() * 100;
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    handleVolumeChange(volume);
    
    const volumeDisplay = document.getElementById('volume-display');
    if (volumeDisplay) {
      volumeDisplay.textContent = `${e.target.value}%`;
    }
  });
}

// 初期化
renderKeyboard('keyboard', [], { interactive: false });
setupSelectButtons();
setupCheckboxListeners();
updateSelectedChordCount();
