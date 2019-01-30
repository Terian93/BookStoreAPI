 module.exports = app => {
    const services = require('../services');
    app.route('/books')
        .get(services.listAllBooks)
        .post(services.addBook);

    app.route('/authors')
        .get(services.listAllAuthors)
        .post(services.addAuthor);

    app.route('/books/:id')
        .get(services.getBook)
        .put(services.updateBook)
        .delete(services.removeBook);

    app.route('/authors/:id')
        .get(services.getAuthor)
        .put(services.updateAuthor)
        .delete(services.removeAuthor);
 };