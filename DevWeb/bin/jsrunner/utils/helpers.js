/**
 * Returns a string that includes the time and a 0 if it is less than 10
 *  else returns the time in a string format
 * @param {number} time - The time
 * @returns {string} The time padded with 0 if necessary
 */
function padZero(time) {
  return (time < 10 ? '0' : '') + time;
}

/**
 * Returns a copy of the word received with a capitalized first letter
 * @param {string} word - The word to capitalize it's first letter
 * @returns {string} The word with a capitalized first letter
 */
function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Returns the current time in the format 'hh-mm-ss-ms'
 * @returns {string} The current time in the 'hh-mm-ss-ms' format
 */
function getTimeStamp() {
  const date = new Date();
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());
  const milliseconds = padZero(Math.floor(date.getMilliseconds() / 10));
  return `${hours}:${minutes}:${seconds}:${milliseconds}`;
}

module.exports = {
  capitalizeFirstLetter,
  getTimeStamp
};