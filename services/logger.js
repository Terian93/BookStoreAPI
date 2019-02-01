const winston = require('winston');
const expressWinston = require('express-winston');

const getDate = () => {
  const date = new Date();
  const str = date.getHours() +
  ':' + date.getMinutes() +
  ':' + date.getSeconds() +
  ':' + date.getMilliseconds() +
  ' ' + date.getDate() +
  '.' + (date.getMonth() + 1) +
  '.' + date.getFullYear();
  return str;
};

const myCustomLevels = {
  levels: {
    request: 0,
    response: 1,
    info: 2,
    error: 2
  },
  colors: {
    request: 'blue',
    response: 'green',
    info: 'yellow',
    'error': 'red'
  }
};
winston.addColors(myCustomLevels.colors);

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.cli()
      )
    }),
    new winston.transports.File({
      filename: 'combined.log',
      format: winston.format.simple()
    })
  ],
  levels: myCustomLevels.levels
});
logger.log('info', 'Server started [' + getDate() + ']');

exports.default = logger;
exports.expressLogger = app => {
  app.use(expressWinston.logger({
    winstonInstance: logger,
    level: 'request',
    meta: true,
    msg: '[' + getDate() + '] >> { method:{{req.method}}, url:{{req.url}} }',
    requestFilter: (req, propName) => req[propName],
    responseFilter: () => undefined
  }));
  app.use(expressWinston.logger({
    winstonInstance: logger,
    level: 'response',
    meta: true,
    msg: '[' + getDate() + '] >> { statusCode:{{res.statusCode}}, responseTime:{{res.responseTime}} }',
    requestFilter: () => undefined
  }));
};
