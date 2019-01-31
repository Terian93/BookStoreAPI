const express = require('express');
const routes = require('./routes');
const errorHandler = require('./services/errorHandler');
const logger = require('./services/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
logger.expressLogger(app);
errorHandler();
routes(app);

app.listen(port);
console.log('Server started on: ' + port);
