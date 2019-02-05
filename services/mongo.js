const mongoose = require('mongoose');
const Book = require('../modules/mongo').BookModel;

// Create
exports.addBook = (req, res) => {
  const bookData = req.body;
  // connect(res, () => {
  //   const book = new Book(bookData);
  //   book.save(err => {
  //     if (err) {
  //       err.type = 'mongoose save() error';
  //       res.status(500);
  //       res.send('Cant add book to colection');
  //       throw err;
  //     }
  //     res.send('Book added to colection');
  //     disconnect();
  //   });
  // });

  const book = new Book(bookData);
  book.save(err => {
    if (err) {
      err.type = 'mongoose save() error';
      res.status(500);
      res.send('Cant add book to colection');
      throw err;
    }
    res.send('Book added to colection');
  });
};

// Read
exports.listAllBooks = (req, res) => {
  const pageOffset = req.body.page * 10 - 10;
  // connect(res, () => {
  //   Book.find()
  //     .skip(pageOffset)
  //     .limit(10)
  //     .then((books, err) => {
  //       if (err) {
  //         err.type = 'mongoose find() error';
  //         res.status(500);
  //         res.send('Cant get books from colection');
  //         throw err;
  //       }
  //       res.send(books);
  //       disconnect();
  //     });
  // });
  Book.find()
    .skip(pageOffset)
    .limit(10)
    .then((books, err) => {
      if (err) {
        err.type = 'mongoose find() error';
        res.status(500);
        res.send('Cant get books from colection');
        throw err;
      }
      res.send(books);
    });
};

exports.getBook = (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  Book.findById(id, (err, book) => {
    if (err) {
      err.type = 'mongoose findById() error';
      res.status(500);
      res.send('Cant get book from colection');
      throw err;
    }
    res.send(book);
  });
};

// Update
exports.updateBook = (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const bookData = req.body;

  Book.updateOne({ _id: id }, bookData, (err, book) => {
    if (err) {
      err.type = 'mongoose updateOne() error';
      res.status(500);
      res.send('Cant remove book from colection');
      throw err;
    }
    res.send('Book was updated');
  });
};

// Delete
exports.removeBook = (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  Book.remove({ _id: id }, (err, book) => {
    if (err) {
      err.type = 'mongoose remove() error';
      res.status(500);
      res.send('Cant remove book from colection');
      throw err;
    }
    res.send('Book was removed from collection');
  });
};
