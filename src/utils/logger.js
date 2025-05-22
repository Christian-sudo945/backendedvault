const config = require('./../../config.json');
const morgan = require('morgan');
const chalk = require('chalk');
const color = config.log.color;
const logger = {
  info: msg => console.log(color ? chalk.blue('[INFO]') : '[INFO]', msg),
  warn: msg => console.log(color ? chalk.yellow('[WARN]') : '[WARN]', msg),
  error: msg => console.log(color ? chalk.red('[ERROR]') : '[ERROR]', msg)
};

const morganMiddleware = morgan((tokens, req, res) => {
  const status = tokens.status(req, res);
  let statusColor = chalk.white;
  if (color) {
    if (status >= 500) statusColor = chalk.red;
    else if (status >= 400) statusColor = chalk.yellow;
    else if (status >= 300) statusColor = chalk.cyan;
    else if (status >= 200) statusColor = chalk.green;
  }
  return [
    color ? chalk.gray(tokens.date(req, res, 'iso')) : tokens.date(req, res, 'iso'),
    color ? chalk.magenta(tokens.method(req, res)) : tokens.method(req, res),
    color ? chalk.cyan(tokens.url(req, res)) : tokens.url(req, res),
    statusColor(status),
    tokens['response-time'](req, res), 'ms'
  ].join(' ');
});

module.exports = { logger, morganMiddleware };
