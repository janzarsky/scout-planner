exports.formatDate = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybné datum)';

  return date.getUTCDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCFullYear();
}

exports.formatTime = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybný čas)';

  return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '') + date.getUTCMinutes();
}

exports.formatDateTime = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybné datum)';

  return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '')
    + date.getUTCMinutes() + ' ' + date.getUTCDate() + '.' + (date.getUTCMonth() + 1)
    + '.' + date.getUTCFullYear();
}

exports.formatDuration = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybná délka)';

  return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '') + date.getUTCMinutes();
}
