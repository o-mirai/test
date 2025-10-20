// 【新規作成】エラーハンドリングの統一モジュール

/**
 * エラーメッセージを表示する（統一されたUI）
 * @param {string} message - 表示するエラーメッセージ
 * @param {boolean} isWarning - 警告レベルかどうか（デフォルト: false）
 */
export function showError(message, isWarning = false) {
    console.error(message);

    // 【改善】alert の代わりに、より洗練された方法を使用することを推奨
    // 本番環境では toast 通知などを使用
    if (!isWarning) {
        alert(`エラー: ${message}\n\nページを再読み込みしてください。`);
    }
}

/**
 * 要素の存在をチェックし、なければエラーを表示
 * @param {string} elementId - チェックする要素のID
 * @returns {HTMLElement|null} - 要素が存在すれば要素、なければnull
 */
export function requireElement(elementId) {
    const element = document.getElementById(elementId);

    if (!element) {
        showError(`必要な要素が見つかりません: #${elementId}`, true);
    }

    return element;
}

/**
 * データの妥当性をチェック
 * @param {any} data - チェックするデータ
 * @param {string} dataName - データ名（エラーメッセージ用）
 * @returns {boolean} - 妥当ならtrue
 */
export function validateData(data, dataName) {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        showError(`${dataName}が不正です`);
        return false;
    }
    return true;
}