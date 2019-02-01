const logger = require('./logger');
const toJSON = require('utils-error-to-json');

const errorHandler = (err) => {
  const json = toJSON(err);
  const errorType = err.type == null
    ? 'UNKNOWN'
    : err.type;
  logger.default.log('error', errorType + ' >> ' + err.message, [json]);
};

const uncaughtExceptionsHandler = () => {
  process.on('uncaughtException', err => {
    if (err.type == null) {
      err.type = 'uncaughtException';
    }
    errorHandler(err);
  });
};

module.exports = {
  errorHandler: errorHandler,
  exceptionsHandler: uncaughtExceptionsHandler
};
