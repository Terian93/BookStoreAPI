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
