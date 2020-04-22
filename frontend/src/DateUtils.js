/**
 * @file Custom functions for parsing and formatting of time and date
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 *
 * Note that the app uses UTC times to avoid problems with timezones.
 */

function formatDate(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybné datum)';

  return `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`;
};

function formatTime(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybný čas)';

  return `${date.getUTCHours()}:${(date.getUTCMinutes() < 10) ? '0' : ''}${date.getUTCMinutes()}`;
};

function formatDateTime(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybné datum)';

  return `${date.getUTCHours()}:${(date.getUTCMinutes() < 10) ? '0' : ''}${date.getUTCMinutes()} ` +
    `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`;
};

function formatDuration(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybná délka)';

  return `${date.getUTCHours()}:${(date.getUTCMinutes() < 10) ? '0' : ''}${date.getUTCMinutes()}`;
};

function formatDay(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime()))
    return '(chybný den)';

  return ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'][(date.getUTCDay() + 6) % 7];
}

function parseDate(str) {
  const vals = str.split('.');
  return Date.UTC(parseInt(vals[2], 10), parseInt(vals[1], 10) - 1, parseInt(vals[0], 10));
};

function parseTime(str) {
  const vals = str.split(':');
  return Date.UTC(1970, 0, 1, parseInt(vals[0], 10), parseInt(vals[1], 10));
};

function parseDateTime(str) {
  const [time, date] = str.split(' ');
  return parseDate(date) + parseTime(time);
};

const parseDuration = parseTime;

function getOnlyTime(ms) {
  const d = new Date(ms);
  return Date.UTC(1970, 0, 1, d.getUTCHours(), d.getUTCMinutes());
}

function getOnlyDate(ms) {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  formatDay,
  parseDate,
  parseTime,
  parseDateTime,
  parseDuration,
  getOnlyTime,
  getOnlyDate,
};
