const mongoose = require('mongoose');
const logger = require('../services/logger').default;
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: String,
  author: String,
  year: Number,
  description: String
});

const authorSchema = new Schema({
  name: String
});

exports.bookModel = mongoose.model('book', bookSchema);
exports.authorModel = mongoose.model('author', authorSchema);

exports.connectMongoDB = () => {
  const db = mongoose.connection;
  db.on('error', () => {
    logger.log('info', 'Connected to mongodb');
    const err = new Error('Failed to connect mongodb');
    err.type = 'Mongodb connection error';
    throw err;
  });
  db.once('open', () => {
    logger.log('info', 'Connected to mongodb');
  });
};
