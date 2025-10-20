// 【新規作成】スコア管理の共通モジュール
// quiz-name.js と quiz-notes.js で重複していたスコア管理ロジックを統合

// 【変更】localStorage を使用せず、インメモリ管理のみに変更
// Claude.ai のアーティファクト環境では localStorage が使用できないため

let correctCount = 0;
let totalCount = 0;
let streakCount = 0;

/**
 * スコアをリセットする
 */
export function resetScore() {
    if (!confirm('スコアをリセットしますか？\nこの操作は取り消せません。')) {
        return;
    }

    correctCount = 0;
    totalCount = 0;
    streakCount = 0;

    console.log('スコアをリセットしました');
    alert('スコアをリセットしました！');

    return { correctCount, totalCount, streakCount };
}

/**
 * スコアを更新する
 * @param {boolean} isCorrect - 正解かどうか
 */
export function updateScore(isCorrect) {
    totalCount++;

    if (isCorrect) {
        correctCount++;
        streakCount++;
    } else {
        streakCount = 0;
    }

    return { correctCount, totalCount, streakCount };
}

/**
 * 現在のスコアを取得する
 */
export function getScore() {
    return { correctCount, totalCount, streakCount };
}

/**
 * スコア表示を更新する（DOM操作）
 */
export function renderScore() {
    const correctElement = document.getElementById("correct-count");
    const streakElement = document.getElementById("streak-count");
    const accuracyElement = document.getElementById("accuracy");

    if (!correctElement || !streakElement || !accuracyElement) {
        console.error('スコア表示要素が見つかりません');
        return;
    }

    correctElement.textContent = correctCount;
    streakElement.textContent = streakCount;

    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    accuracyElement.textContent = accuracy + "%";
}