exports.formatDate = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybné datum)';

  return date.getUTCDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCFullYear();
};

exports.formatTime = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybný čas)';

  return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '') + date.getUTCMinutes();
};

exports.formatDateTime = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybné datum)';

  return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '')
    + date.getUTCMinutes() + ' ' + date.getUTCDate() + '.' + (date.getUTCMonth() + 1)
    + '.' + date.getUTCFullYear();
};

exports.formatDuration = function(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybná délka)';

  return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '') + date.getUTCMinutes();
};

exports.parseDate = function(str) {
  const vals = str.split('.');
  return Date.UTC(parseInt(vals[2], 10), parseInt(vals[1], 10) - 1, parseInt(vals[0], 10));
};

exports.parseTime = function(str) {
  const vals = str.split(':');
  return Date.UTC(1970, 0, 1, parseInt(vals[0], 10), parseInt(vals[1], 10));
};

exports.parseDuration = exports.parseTime;
