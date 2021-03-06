const express = require('express');
const routes = require('./routes');
const exceptionsHandler = require('./services/errorHandler').exceptionsHandler;
const logger = require('./services/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
logger.expressLogger(app);
exceptionsHandler();
routes(app);

app.listen(port);
console.log('Server started on: ' + port);
