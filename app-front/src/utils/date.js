/**
 * 日付を指定された形式の文字列にフォーマットする関数
 * @param {Date | String} date フォーマットしたい日付（Dateオブジェクトか日付文字列）
 * @param {String} separator 区切り文字（デフォルトは '/'）
 * @returns {String} フォーマットされた日付文字列
 */
export const formatDate = (date, separator = '/', addHm = false) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  if (addHm) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day} ${hours}:${minutes}`
  } else {
    return `${year}${separator}${month}${separator}${day}`;
  }
};

/**
 * 日付が有効かどうかをチェックする関数
 * @param {String} dateString
 * @returns {Boolean} 日付が有効かどうか
 */
export const isValidDate = (dateString) => {
  // Dateオブジェクトに変換、その結果の時間を取得
  const time = new Date(dateString).getTime();

  // 時間がNaNでなければ、有効な日付だと判断
  return !isNaN(time);
};