/**
 * 日付を指定された形式の文字列にフォーマットする関数
 * @param {Date | String} date フォーマットしたい日付（Dateオブジェクトか日付文字列）
 * @param {String} separator 区切り文字（デフォルトは '/'）
 * @returns {String} フォーマットされた日付文字列
 */
export const formatDate = (date, separator = '/') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  //separatorの文字で区切る
  return `${year}${separator}${month}${separator}${day}`;
};