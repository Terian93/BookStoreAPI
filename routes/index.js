/**
 * <<<ALL ROUTES>>> req type - body
 * /books
 *  GET - {id: int (where books.id > id)}
 *  POST - {name: string, author_id: int, year: int, description: string}
 *  POST(bulk) - [{...},{...}] or [[...],[...]]
 * /authors
 *  GET - none
 *  POST - {name: string}
 *  POST(bulk) - [{...},{...}] or [[...],[...]]
 * /users
 *  GET - none
 *  POST - {name: string}
 *  POST(bulk) - [{...},{...}] or [[...],[...]]
 * /books/:id
 *  GET - none
 *  PUT - {name: string, author_id: int, year: int, description: string}
 *  DELETE - none
 * /authors/:id
 *  GET - none
 *  PUT - {name: string}
 *  DELETE - none
 * /users/:id
 *  GET - none
 *  PUT - {name: string, author_id: int, year: int, description: string}
 *  DELETE - none
 * /users/:id/books
 *  GET - none
 *  POST - {id: int (book_id)}
 *  PUT - {oldId: int (book_id), newId: int (book_id)}
 *  DELETE - {id: int (book_id)}
 */
module.exports = app => {
  const services = require('../services');
  app.route('/books')
    .get(services.listAllBooks)
    .post(services.addBook);

  app.route('/authors')
    .get(services.listAllAuthors)
    .post(services.addAuthor);

  app.route('/users')
    .get(services.listAllUsers)
    .post(services.addUser);

  app.route('/books/:id')
    .get(services.getBook)
    .put(services.updateBook)
    .delete(services.removeBook);

  app.route('/authors/:id')
    .get(services.getAuthor)
    .put(services.updateAuthor)
    .delete(services.removeAuthor);

  app.route('/users/:id')
    .get(services.getUser)
    .put(services.updateUser)
    .delete(services.removeUser);

  app.route('/users/:id/books')
    .get(services.getUserBooks)
    .post(services.addUserBooks)
    .put(services.updateUserBook)
    .delete(services.removeUserBook);
};
