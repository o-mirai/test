// 【新規作成】UI関連の定数を統一管理
// CSSクラス名などのマジックストリングを削減

export const CSS_CLASSES = {
    // 鍵盤のクラス
    WHITE_KEY: 'white-key',
    BLACK_KEY: 'black-key',
    ACTIVE: 'active',
    SELECTED: 'selected',

    // ボタンのクラス
    CHOICE: 'choice',
    CORRECT: 'correct',
    INCORRECT: 'incorrect',

    // アニメーション
    CORRECT_ANIMATION: 'correct-animation',
    INCORRECT_ANIMATION: 'incorrect-animation'
};

export const ELEMENT_IDS = {
    // 共通
    KEYBOARD: 'keyboard',
    RESULT: 'result',

    // スコア関連
    CORRECT_COUNT: 'correct-count',
    STREAK_COUNT: 'streak-count',
    ACCURACY: 'accuracy',

    // quiz-name.html
    NEXT_BUTTON: 'next',
    REPLAY_BUTTON: 'replay',
    RESET_SCORE_BUTTON: 'reset-score',

    // quiz-notes.html
    CHORD_NAME: 'chord-name',
    CHECK_BUTTON: 'check',
    RESET_BUTTON: 'reset',
    SELECTED_COUNT: 'selected-count',
    MIDI_STATUS: 'midi-status'
};

export const SELECTORS = {
    CHORD_BUTTONS: '.chord-buttons button',
    CHOICES: '.choice'
};