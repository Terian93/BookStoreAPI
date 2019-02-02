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
          `INSERT INTO ${table} (${fields}) VALUES ?`,
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
    bulkCreate(req.body, 'books', 'name, author_id, year, description', res);
  } else if (req.body instanceof Object) {
    const name = req.body.name;
    const authorId = req.body.author_id;
    const year = req.body.year;
    const description = req.body.description;

    sql.newConnection().then((connection, err) => {
      if (err) {
        res.status(503);
        res.send('Cant reach MySQL database');
        throw err;
      }
      connection.beginTransaction(err => {
        if (err) {
          res.status(500);
          res.send('Failed to create new items to books table');
          err.type = 'transaction error';
          throw err;
        }
        connection.query(queries.addBookQuery, [name, authorId, year, description], err => {
          if (err) {
            connection.rollback(error => {
              res.status(500);
              res.send('Failed to create new items to books table');
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
                res.send('Failed to create new items to books table');
                err.type = 'Transaction commit error';
                throw err;
              });
            }
            res.send('Item added to books');
            sql.closeConnection(connection);
          });
        });
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
    res.send('Wrong body type');
  }
};

exports.addAuthor = (req, res) => {
  if (req.body instanceof Array) {
    bulkCreate(req.body, 'authors', 'name', res);
  } else if (req.body instanceof Object) {
    const name = req.body.name;

    sql.newConnection().then((connection, err) => {
      if (err) {
        res.status(503);
        res.send('Cant reach MySQL database');
        throw err;
      }
      connection.beginTransaction(err => {
        if (err) {
          res.status(500);
          res.send('Failed to create new items to books table');
          err.type = 'transaction error';
          throw err;
        }
        connection.query(queries.addAuthorQuery, [name], err => {
          if (err) {
            connection.rollback(error => {
              res.status(500);
              res.send('Failed to create new items to authors table');
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
              connection.rollback((error) => {
                res.status(500);
                res.send('Failed to create new items to books table');
                if (error !== null) {
                  error.type = 'Query error';
                  throw error;
                } else {
                  err.type = 'Query error';
                  throw err;
                }
              });
            }
            res.send('Item added to authors');
            sql.closeConnection(connection);
          });
        });
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
    res.send('Wrong body type');
  }
};

// Read
exports.listAllBooks = (req, res) => {
  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to get items from books table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.selectAllBooksQuery, (err, rows) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to get items from books table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to get items from books table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.json(rows);
          sql.closeConnection(connection);
        });
      });
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
};

exports.listAllAuthors = (req, res) => {
  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to get items from authors table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.selectAllAuthorsQuery, (err, rows) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to get items from authors table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to get items from authors table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.json(rows);
          sql.closeConnection(connection);
        });
      });
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
};

exports.getBook = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to get item from books table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.selectBookQuery, [id], (err, rows) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to get item from books table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to get item from books table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.json(rows);
          sql.closeConnection(connection);
        });
      });
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
};

exports.getAuthor = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to get item from authors table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.selectAuthorQuery, [id], (err, rows) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to get item from authors table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to get item from authors table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.json(rows);
          sql.closeConnection(connection);
        });
      });
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
};

// Update
exports.updateBook = (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const authorId = req.body.author_id;
  const year = req.body.year;
  const description = req.body.description;

  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to update item from books table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.updateBookQuery, [name, authorId, year, description, id], (err) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to update item from books table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to update item from books table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.send('Book with id = ' + id + ' was updated');
          sql.closeConnection(connection);
        });
      });
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
};

exports.updateAuthor = (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to update item from authors table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.updateAuthorQuery, [name, id], (err) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to update item from authors table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to update item from authors table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.send('Author with id = ' + id + ' was updated');
          sql.closeConnection(connection);
        });
      });
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
};

// Delete
exports.removeBook = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to remove item from books table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.removeBookQuery, [id], (err) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to remove item from books table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to remove item from books table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.send('Book with id = ' + id + ' was removed');
          sql.closeConnection(connection);
        });
      });
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
};

exports.removeAuthor = (req, res) => {
  const id = req.params.id;

  sql.newConnection().then((connection, err) => {
    if (err) {
      res.status(503);
      res.send('Cant reach MySQL database');
      throw err;
    }
    connection.beginTransaction(err => {
      if (err) {
        res.status(500);
        res.send('Failed to remove item from authors table');
        err.type = 'transaction error';
        throw err;
      }
      connection.query(queries.removeAuthorQuery, [id], (err) => {
        if (err) {
          connection.rollback(error => {
            res.status(500);
            res.send('Failed to remove item from authors table');
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
            connection.rollback((error) => {
              res.status(500);
              res.send('Failed to remove item from authors table');
              if (error !== null) {
                error.type = 'Query error';
                throw error;
              } else {
                err.type = 'Query error';
                throw err;
              }
            });
          }
          res.send('Author with id = ' + id + ' was removed');
          sql.closeConnection(connection);
        });
      });
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
};
