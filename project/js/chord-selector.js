// コード選択機能の共通モジュール
import { ROOT_NOTES, CHORD_TYPES, generateChordNotes, generateChordName } from './constants.js';

/**
 * 選択されたコード数を更新して表示
 */
export function updateSelectedChordCount() {
  const rootCheckboxes = document.querySelectorAll('.root-checkbox:checked');
  const typeCheckboxes = document.querySelectorAll('.type-checkbox:checked');
  
  const count = rootCheckboxes.length * typeCheckboxes.length;
  const countElement = document.getElementById('selected-chord-count');
  
  if (countElement) {
    countElement.textContent = count;
  }
  
  return count;
}

/**
 * 全選択・全解除ボタンの機能を設定
 */
export function setupSelectButtons() {
  const selectAllRoots = document.getElementById('select-all-roots');
  const deselectAllRoots = document.getElementById('deselect-all-roots');
  const selectAllTypes = document.getElementById('select-all-types');
  const deselectAllTypes = document.getElementById('deselect-all-types');

  if (selectAllRoots) {
    selectAllRoots.addEventListener('click', () => {
      document.querySelectorAll('.root-checkbox').forEach(cb => cb.checked = true);
      updateSelectedChordCount();
    });
  }

  if (deselectAllRoots) {
    deselectAllRoots.addEventListener('click', () => {
      document.querySelectorAll('.root-checkbox').forEach(cb => cb.checked = false);
      updateSelectedChordCount();
    });
  }

  if (selectAllTypes) {
    selectAllTypes.addEventListener('click', () => {
      document.querySelectorAll('.type-checkbox').forEach(cb => cb.checked = true);
      updateSelectedChordCount();
    });
  }

  if (deselectAllTypes) {
    deselectAllTypes.addEventListener('click', () => {
      document.querySelectorAll('.type-checkbox').forEach(cb => cb.checked = false);
      updateSelectedChordCount();
    });
  }
}

/**
 * チェックボックスの変更を監視
 */
export function setupCheckboxListeners() {
  document.querySelectorAll('.root-checkbox, .type-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedChordCount);
  });
}

/**
 * 選択されたコードのリストを生成
 * @returns {Array} コード配列 [{name: string, notes: string[]}]
 */
export function getSelectedChords() {
  const rootCheckboxes = document.querySelectorAll('.root-checkbox:checked');
  const typeCheckboxes = document.querySelectorAll('.type-checkbox:checked');

  const selectedRoots = Array.from(rootCheckboxes).map(cb => cb.value);
  const selectedTypes = Array.from(typeCheckboxes).map(cb => cb.value);

  if (selectedRoots.length === 0 || selectedTypes.length === 0) {
    return null;
  }

  const chords = [];
  selectedRoots.forEach(root => {
    selectedTypes.forEach(type => {
      const chordName = generateChordName(root, type);
      const notes = generateChordNotes(root, type);
      if (chordName && notes.length > 0) {
        chords.push({ name: chordName, notes: notes });
      }
    });
  });

  return chords.length > 0 ? chords : null;
}
