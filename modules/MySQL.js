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
    `INSERT INTO books (name, author_id, year, description)
    VALUES (?, ?, ?, ?)`,
  addAuthorQuery:
    `INSERT INTO authors (name)
    VALUES (?)`,
  addUserQuery:
    `INSERT INTO users (name)
    VALUES (?)`,
  addBookToUserQuery:
    `INSERT INTO books_users (book_id, user_id)
    VALUES (?, ?)`,
  selectAllBooksQuery:
    `SELECT books.id, books.name, authors.name, books.year, books.description
    FROM books INNER JOIN authors ON books.author_id = authors.id
    ORDER BY books.id
    LIMIT 10
    OFFSET ?`,
  selectAllAuthorsQuery:
    `SELECT *
    FROM authors
    ORDER BY id`,
  selectAllUsersQuery:
    `SELECT *
    FROM users
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
  selectUserQuery:
    `SELECT *
    FROM users
    WHERE id = ?
    ORDER BY id`,
  selectUserBooksQuery:
    `SELECT books.id, books.name AS book, authors.name AS author, books.year, books.description
    FROM books 
    INNER JOIN authors on books.author_id = authors.id
    INNER JOIN books_users on books.id = books_users.book_id
    INNER JOIN users on users.id = books_users.user_id
    WHERE users.id = ?
    ORDER BY books.id`,
  updateBookQuery:
    `UPDATE books
    SET name = ?, author_id = ?, year = ?, description = ?
    WHERE id = ?`,
  updateAuthorQuery:
    `UPDATE authors
    SET name = ?
    WHERE id = ?`,
  updateUserQuery:
    `UPDATE users
    SET name = ?
    WHERE id = ?`,
  updateUserBookQuery:
    `UPDATE books_users
    SET book_id = ?
    WHERE user_id = ? AND book_id = ?`,
  removeBookQuery:
    `DELETE FROM books
    WHERE id = ?`,
  removeAuthorQuery:
    `DELETE FROM authors
    WHERE id = ?`,
  removeUserQuery:
    `DELETE FROM users
    WHERE id = ?`,
  removeUserBookQuery:
    `DELETE FROM books_users
    WHERE book_id = ? AND user_id = ?`
};
