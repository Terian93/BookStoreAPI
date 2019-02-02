const mysql = require('mysql');
const logger = require('../services/logger').default;
const connectionData = require('../configs/MySQL').rootConnectionData;

exports.newConnection = () => new Promise((resolve, reject) => {
  const connection = mysql.createConnection(connectionData);
  connection.connect(err => {
    if (err) {
      err.type = 'MySQL connection error';
      reject(err);
    } else {
      logger.log('info', 'MySQL (id:' + connection.threadId + ') database connected');
      resolve(connection);
    }
  });
});

exports.closeConnection = (connection) => {
  connection.end(err => {
    if (err) {
      throw err;
    } else {
      logger.log('info', 'MySQL (id:' + connection.threadId + ') database disconected');
    }
  });
};

// Queries
exports.queries = {
  addBookQuery:
      `INSERT INTO books (name, author_id, year)
      VALUES (?, ?, ?)`,
  addAuthorQuery:
      `INSERT INTO authors (name)
      VALUES (?)`,
  selectAllBooksQuery:
      `SELECT books.id, books.name, authors.name 
      FROM books, authors 
      WHERE books.author_id = authors.id
      ORDER BY books.id`,
  selectAllAuthorsQuery:
      `SELECT *
      FROM authors
      ORDER BY id`,
  selectBookQuery:
      `SELECT *
      FROM books
      WHERE id = ?
      ORDER BY id`,
  selectAuthorQuery:
      `SELECT *
      FROM authors
      WHERE id = ?
      ORDER BY id`,
  updateBookQuery:
      `UPDATE books
      SET name = ?, author_id = ?, year = ?
      WHERE id = ?`,
  updateAuthorQuery:
      `UPDATE authors
      SET name = ?
      WHERE id = ?`,
  removeBookQuery:
      `DELETE FROM books
      WHERE id = ?`,
  removeAuthorQuery:
      `DELETE FROM authors
      WHERE id = ?`
};
