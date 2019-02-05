const mongoose = require('mongoose');
const logger = require('../services/logger').default;
const host = require('../configs/mongo').host;
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: String,
  author: String,
  year: Number,
  description: String
});
const BookModel = mongoose.model('book', bookSchema);

exports.BookModel = BookModel;

const db = mongoose.connection;
db.on('error', () => {
  logger.log('error', 'Cant connect to mongodb');
  process.exit(1);
});
// db.once('open', () => {
//   logger.log('info', 'Connected to mongodb');
// });
// db.once('close', () => {
//   logger.log('info', 'Disconnected from mongodb');
// });
exports.connect = () => {
  mongoose.connect(host, { useNewUrlParser: true }).then(() => {
    logger.log('info', 'Connected to mongodb');
  });
};

// exports.connect = (res, innerProcess) => {
//   return mongoose.connect(host, { useNewUrlParser: true }).then((resolve, reject) => {
//     if (reject) {
//       res.status(500);
//       res.send('Cant connect to MongoDB');
//       throw reject;
//     };
//     logger.log('info', 'Connected to mongodb');
//     innerProcess();
//   });
// };

exports.disconnect = () => {
  mongoose.disconnect().then((res, err) => {
    if (err) {
      throw err;
    }
    logger.log('info', 'Disconnected from mongodb');
  });
};
