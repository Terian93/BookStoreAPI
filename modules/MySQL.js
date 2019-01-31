const mysql = require('mysql');
const connectionData = require('../configs/MySQL').remoteConnectionData;

exports.newConnection = () => {
  const connection = mysql.createConnection(connectionData);
  connection.connect(err => {
    if (err) {
      console.log(err);
    } else {
      console.log('MySQL (id:' + connection.threadId + ') database connected');
    }
  });
  return connection;
};

exports.closeConnection = (connection) => {
  connection.end(err => {
    if (err) {
      console.log(err);
    } else {
      console.log('MySQL (id:' + connection.threadId + ') database disconected');
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
