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
    inputArray.forEach((element, index) => {
      inputArray[index] = Object.values(element);
    });
  }
  if (inputArray[0] instanceof Array) {
    sql.newConnection().then((connection, err) => {
      if (err) {
        console.log('errora');
        res.status(503);
        res.send('Cant reach MySQL database');
        throw err;
      }
      connection.beginTransaction(err => {
        if (err) {
          res.status(500);
          res.send('Failed to create new items to ' + table + ' table');
          err.type = 'transaction error';
          throw err;
        }
        connection.query(
          `INSERT INT ${table} (${fields}) VALUES ?`,
          [inputArray],
          err => {
            if (err) {
              connection.rollback(error => {
                res.status(500);
                res.send('Failed to create new items to ' + table + ' table');
                if (error !== null) {
                  error.type = 'Query error';
                  throw error;
                } else {
                  err.type = 'Query error';
                  throw err;
                }
              });
            }

            connection.commit(err => {
              if (err) {
                connection.rollback((err) => {
                  res.status(500);
                  res.send('Failed to create new items to ' + table + ' table');
                  err.type = 'Transaction commit error';
                  throw err;
                });
              }
              if (!res.headersSent) {
                res.send('Items added to ' + table);
              }
              sql.closeConnection(connection);
            });
          }
        );
      });
    }).catch(err => {
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
    });
  } else {
    res.status(400);
    res.send('Wrong data type was send in body');
  }
};

// Create
exports.addBook = (req, res) => {
  if (req.body instanceof Array) {
    bulkCreate(req.body, 'books', 'name, author_id, year', res);
  } else if (req.body instanceof Object) {
    const name = req.body.name;
    const authorId = req.body.author_id;
    const year = req.body.year;

    sql.connection.beginTransaction(err => {
      if (err) {
        throw err;
      }
      sql.connection.query(queries.addBookQuery, [name, authorId, year], (err) => {
        if (err) {
          // TODO: choose right status code for query error
          sql.connection.rollback();
          res.send('Querry error: ' + err);
        } else {
          res.send('Book added');
        }
      });
    });
  } else {
    res.send('Error: wrong body type');
  }
};

exports.addAuthor = (req, res) => {
  if (req.body instanceof Array) {
    bulkCreate(req.body, 'authors', 'name', res);
  } else if (req.body instanceof Object) {
    const name = req.body.name;

    sql.connection.query(queries.addAuthorQuery, [name], (err) => {
      if (err) {
        res.send('Querry error: ' + err);
      } else {
        res.send('Author added');
      }
    });
  } else {
    res.send('Error: wrong body type');
  }
};

// Read
exports.listAllBooks = (req, res) => {
  const connection = sql.newConnection();
  connection.beginTransaction(err => {
    if (err) {
      res.send('Transaction error: ' + err);
    } else {
      connection.query(queries.selectAllBooksQuery, (err, rows) => {
        if (err) {
          connection.rollback();
          sql.closeConnection(connection);
        } else {
          console.log('rows sent');
          res.json(rows);
          connection.commit(err => {
            if (err) {
              connection.rollback(() => {
                throw err;
              });
            } else {
              sql.closeConnection(connection);
            }
          });
        }
      });
    }
  });
};

exports.listAllAuthors = (req, res) => {
  sql.connection.query(queries.selectAllAuthorsQuery, (err, rows) => {
    if (err) {
      res.send('Querry error: ' + err);
    } else {
      res.json(rows);
    }
  });
};

exports.getBook = (req, res) => {
  const id = req.params.id;
  sql.connection.query(queries.selectBookQuery, [id], (err, rows) => {
    if (err) {
      res.send('Querry error: ' + err);
    } else {
      res.json(rows);
    }
  });
};

exports.getAuthor = (req, res) => {
  const id = req.params.id;
  sql.connection.query(queries.selectAuthorQuery, [id], (err, rows) => {
    if (err) {
      res.send('Querry error: ' + err);
    } else {
      res.json(rows);
    }
  });
};

// Update
exports.updateBook = (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const authorId = req.body.author_id;
  const year = req.body.year;

  sql.connection.query(queries.updateBookQuery, [name, authorId, year, id], (err) => {
    if (err) {
      res.send('Querry error: ' + err);
    } else {
      res.send('Book with id = ' + id + ' was updated');
    }
  });
};

exports.updateAuthor = (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  sql.connection.query(queries.updateAuthorQuery, [name, id], (err) => {
    if (err) {
      res.send('Querry error: ' + err);
    } else {
      res.send('Author with id = ' + id + ' was updated');
    }
  });
};

// Delete
exports.removeBook = (req, res) => {
  const id = req.params.id;
  sql.connection.query(queries.removeBookQuery, [id], (err) => {
    if (err) {
      res.send('Querry error: ' + err);
    } else {
      res.send('Book with id = ' + id + ' was removed');
    }
  });
};

exports.removeAuthor = (req, res) => {
  const id = req.params.id;
  sql.connection.query(queries.removeAuthorQuery, [id], (err) => {
    if (err) {
      res.send('Querry error: ' + err);
    } else {
      res.send('Author with id = ' + id + ' was removed');
    }
  });
};
