const sql = require('../modules/MySQL');
const queries = require('../modules/MySQL').queries;
const errorHandler = require('./errorHandler').errorHandler;

const bulkCreate = (inputArray, table, fields, res) => {
  if (inputArray.length === 0) {
    res.status(400);
    res.send('Empty array was send');
    return false;
  }
  if (inputArray[0] instanceof Object && !(inputArray[0] instanceof Array)) {
    console.log(inputArray);
    inputArray.forEach((element, index) => {
      inputArray[index] = Object.values(element);
    });
    console.log(inputArray);
  }
  if (inputArray[0] instanceof Array) {
    sql.newConnection().then((connection, err) => {
      const data = {
        err,
        res,
        connection,
        resErrorMessage: 'Failed to create new items to ' + table + ' table',
        resFunction: (res, rows) => res.send('Items added to ' + table),
        queryString: `INSERT INTO ${table} (${fields}) VALUES ?`,
        queryValues: [inputArray]
      };
      queryTransaction(data);
    }).catch(err => connectionErrorHandler(err, res));
  } else {
    res.status(400);
    res.send('Wrong data type was send in body');
  }
};

const commitTransaction = (data) => {
  data.connection.commit(err => {
    if (err) {
      data.connection.rollback((error) => {
        data.res.status(500);
        data.res.send(data.resErrorMessage);
        if (error !== null) {
          error.type = 'Commit error';
          throw error;
        } else {
          err.type = 'Commit error';
          throw err;
        }
      });
    }
    if (data.res.headersSent === false) {
      data.resFunction(data.res, data.rows);
    }
    sql.closeConnection(data.connection);
  });
};

/*
data = {
  err: err from newConnection()
  res: response
  connection: connection from newConnection()
  resErrorMessage: standart error message string
  resFunction: function with final response operations. MUST have base like this (res, rows) => {}
  queryString: query from queries object
  queryValues: array with values required for query. If values not required, set as empty array []
}
*/
const queryTransaction = (data) => {
  if (data.err) {
    data.res.status(503);
    data.res.send('Cant reach MySQL database');
    throw data.err;
  }
  data.connection.beginTransaction(err => {
    if (err) {
      data.res.status(500);
      data.res.send(data.resErrorMessage);
      err.type = 'transaction error';
      throw err;
    }
    data.connection.query(data.queryString, data.queryValues, (err, rows) => {
      if (err) {
        data.connection.rollback(error => {
          data.res.status(500);
          data.res.send(data.resErrorMessage);
          if (error !== null) {
            error.type = 'Query error';
            throw error;
          } else {
            err.type = 'Query error';
            throw err;
          }
        });
      }
      data.rows = rows;
      commitTransaction(data);
    });
  });
};

const connectionErrorHandler = (err, res) => {
  if (err.type == null) {
    err.type = 'MySQL error';
  }
  if (res.headersSent !== true) {
    if (err.type === 'MySQL connection error') {
      res.status(503);
      res.send('Cant reach MySQL database');
    } else {
      res.status(500);
      res.send('Unknown internal server error');
    }
  }
  errorHandler(err);
};

// Create
exports.addBook = (req, res) => {
  if (req.body instanceof Array) {
    bulkCreate(req.body, 'books', 'name, author_id, year, description', res);
  } else if (req.body instanceof Object) {
    const name = req.body.name;
    const authorId = req.body.author_id;
    const year = req.body.year;
    const description = req.body.description;

    sql.newConnection().then((connection, err) => {
      const data = {
        err,
        res,
        connection,
        resErrorMessage: 'Failed to create new items to books table',
        resFunction: (res, rows) => res.send('Item added to books'),
        queryString: queries.addBookQuery,
        queryValues: [name, authorId, year, description]
      };
      queryTransaction(data);
    }).catch(err => connectionErrorHandler(err, res));
  } else {
    res.send('Wrong body type');
  }
};

exports.addAuthor = (req, res) => {
  if (req.body instanceof Array) {
    bulkCreate(req.body, 'authors', 'name', res);
  } else if (req.body instanceof Object) {
    const name = req.body.name;

    sql.newConnection().then((connection, err) => {
      const data = {
        err,
        res,
        connection,
        resErrorMessage: 'Failed to create new items to authors table',
        resFunction: (res, rows) => res.send('Item added to authors'),
        queryString: queries.addAuthorQuery,
        queryValues: [name]
      };
      queryTransaction(data);
    }).catch(err => connectionErrorHandler(err, res));
  } else {
    res.send('Wrong body type');
  }
};

exports.addUser = (req, res) => {
  if (req.body instanceof Array) {
    bulkCreate(req.body, 'users', 'name', res);
  } else if (req.body instanceof Object) {
    const name = req.body.name;

    sql.newConnection().then((connection, err) => {
      const data = {
        err,
        res,
        connection,
        resErrorMessage: 'Failed to create new items to users table',
        resFunction: (res, rows) => res.send('Item added to users'),
        queryString: queries.addUserQuery,
        queryValues: [name]
      };
      queryTransaction(data);
    }).catch(err => connectionErrorHandler(err, res));
  } else {
    res.send('Wrong body type');
  }
};

exports.addUserBooks = (req, res) => {
  const userId = req.params.id;
  const bookId = req.body.id;

  if (req.body instanceof Array) {
    const data = req.body;
    data.forEach((element, index) => {
      data[index] = { book_id: element.id, user_id: userId };
    });
    console.log(data);
    bulkCreate(
      data,
      'books_users',
      'book_id, user_id',
      res
    );
  } else if (req.body instanceof Object) {
    sql.newConnection().then((connection, err) => {
      const data = {
        err,
        res,
        connection,
        resErrorMessage: 'Failed to create new items to books_users table',
        resFunction: (res, rows) => res.send('Item added to books_users'),
        queryString: queries.addBookToUserQuery,
        queryValues: [bookId, userId]
      };
      queryTransaction(data);
    }).catch(err => connectionErrorHandler(err, res));
  } else {
    res.send('Wrong body type');
  }
};

// Read
exports.listAllBooks = (req, res) => {
  const pageOffset = req.body.page * 10;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to get items from books table',
      resFunction: (res, rows) => res.json(rows),
      queryString: queries.selectAllBooksQuery,
      queryValues: [pageOffset]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.listAllAuthors = (req, res) => {
  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to get items from authors table',
      resFunction: (res, rows) => res.json(rows),
      queryString: queries.selectAllAuthorsQuery,
      queryValues: []
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.listAllUsers = (req, res) => {
  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to get items from users table',
      resFunction: (res, rows) => res.json(rows),
      queryString: queries.selectAllUsersQuery,
      queryValues: []
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.getBook = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to get item from books table',
      resFunction: (res, rows) => res.json(rows),
      queryString: queries.selectBookQuery,
      queryValues: [id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.getAuthor = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to get item from authors table',
      resFunction: (res, rows) => res.json(rows),
      queryString: queries.selectAuthorQuery,
      queryValues: [id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.getUser = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to get item from users table',
      resFunction: (res, rows) => res.json(rows),
      queryString: queries.selectUserQuery,
      queryValues: [id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.getUserBooks = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to get user books',
      resFunction: (res, rows) => res.json(rows),
      queryString: queries.selectUserBooksQuery,
      queryValues: [id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

// Update
exports.updateBook = (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const authorId = req.body.author_id;
  const year = req.body.year;
  const description = req.body.description;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to update item from books table',
      resFunction: (res, rows) => res.send('Book with id = ' + id + ' was updated'),
      queryString: queries.updateBookQuery,
      queryValues: [name, authorId, year, description, id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.updateAuthor = (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to update item from authors table',
      resFunction: (res, rows) => res.send('Author with id = ' + id + ' was updated'),
      queryString: queries.updateAuthorQuery,
      queryValues: [name, id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.updateUser = (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to update item from users table',
      resFunction: (res, rows) => res.send('User with id = ' + id + ' was updated'),
      queryString: queries.updateUserQuery,
      queryValues: [name, id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.updateUserBook = (req, res) => {
  const userId = req.params.id;
  const oldBookId = req.body.oldId;
  const newBookId = req.body.newId;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to update item from books_users table',
      resFunction: (res, rows) => res.send('Book was updated for user with id = ' + userId),
      queryString: queries.updateUserBookQuery,
      queryValues: [newBookId, userId, oldBookId]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

// Delete
exports.removeBook = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to remove item from books table',
      resFunction: (res, rows) => res.send('Book with id = ' + id + ' was removed'),
      queryString: queries.removeBookQuery,
      queryValues: [id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.removeAuthor = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to remove item from authors table',
      resFunction: (res, rows) => res.send('Author with id = ' + id + ' was removed'),
      queryString: queries.removeAuthorQuery,
      queryValues: [id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.removeUser = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to remove item from users table',
      resFunction: (res, rows) => res.send('User with id = ' + id + ' was removed'),
      queryString: queries.removeUserQuery,
      queryValues: [id]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};

exports.removeUserBook = (req, res) => {
  const bookId = req.body.id;
  const userId = req.params.id;

  sql.newConnection().then((connection, err) => {
    const data = {
      err,
      res,
      connection,
      resErrorMessage: 'Failed to remove item from books_users table',
      resFunction: (res, rows) => res.send('Book was removed from user with id = ' + userId),
      queryString: queries.removeUserBookQuery,
      queryValues: [bookId, userId]
    };
    queryTransaction(data);
  }).catch(err => connectionErrorHandler(err, res));
};
