const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const routes = require('./routes');
routes(app);


app.listen(port);
console.log('Server started on: ' + port);
