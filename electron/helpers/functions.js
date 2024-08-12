const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function logWithColor(message, colorCode = "yellow", errorMessage = "") {
  const color = colors[colorCode] || colors.yellow;
  const output = errorMessage ? `${message}\n${errorMessage}` : message;
  console.log(`${color}${output}\x1b[0m`);
}
module.exports = { logWithColor };
