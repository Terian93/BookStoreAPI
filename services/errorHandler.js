const logger = require('./logger');
const toJSON = require('utils-error-to-json');

const errorHandler = () => {
  process.on('uncaughtException', (err) => {
    const json = toJSON(err);
    logger.default.log('error', 'Error handler >> ' + err.message, [json]);
  });
};
module.exports = errorHandler;
