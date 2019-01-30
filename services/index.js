const sql = require('../modules/MySQL');
const queries = require('../configs/MySQL').queries;

//TODO: change all errors to throw for global error handler
const bulkCreate = (inputArray, table, fields, res) => {
    if (inputArray.length === 0) {
        res.send('Error: Empty array was send');
        return false;
    } 
    if (inputArray[0] instanceof Object && !(inputArray[0] instanceof Array)) {
        inputArray.forEach((element, index) =>
            inputArray[index] = Object.values(element)
        );
    }
    if (inputArray[0] instanceof Array) {
        sql.startConnection();
        sql.connection.beginTransaction(err => {
            if (err) {
                res.send('Transaction error: '+ err);
            } else {
                sql.connection.query(
                    `INSERT INTO ${table} (${fields}) VALUES ?`, 
                    [inputArray], 
                    err => {
                        if (err) {
                            sql.connection.rollback();
                            res.send('Querry error: '+ err); 
                        } else {
                            sql.connection.commit();
                            res.send('New items was added');
                            sql.connection.end();
                        }
                    }
                );
            }   
        });
    } else {
        res.send('Error: Wrong data type was send in body');
    }
}

//Create
exports.addBook = (req, res) => {
    if (req.body instanceof Array) {
        bulkCreate(req.body, 'books', 'name, author_id, year', res);
    } else if (req.body instanceof Object) {
        const name = req.body.name;
        const authorId = req.body.author_id;
        const year = req.body.year;
        
        sql.connection.beginTransaction()
        sql.connection.query(queries.addBookQuery, [name, authorId, year], (err) => {
            if (err) {
                //TODO: choose right status code for query error
                sql.connection.rollback();
                res.send('Querry error: ' + err);
            } else {
                res.send('Book added');
            }
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
//Read
exports.listAllBooks = (req, res) => {
    sql.connection.query(queries.selectAllBooksQuery, (err, rows) => {
        if (err) {
            res.send('Querry error: '+err);
        } else {
            res.json(rows);
        }
    })
};

exports.listAllAuthors = (req, res) => {
    sql.connection.query(queries.selectAllAuthorsQuery, (err, rows) => {
        if (err) {
            res.send('Querry error: '+err);
        } else {
            res.json(rows);
        }
    })
};

exports.getBook = (req, res) => {
    const id = req.params.id;
    sql.connection.query(queries.selectBookQuery, [id], (err, rows) => {
        if (err) {
            res.send('Querry error: '+err);
        } else {
            res.json(rows);
        }
    });
};

exports.getAuthor = (req, res) => {
    const id = req.params.id;
    sql.connection.query(queries.selectAuthorQuery, [id], (err, rows) => {
        if (err) {
            res.send('Querry error: '+err);
        } else {
            res.json(rows);
        }
    });
};

//Update
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
            res.send('Querry error: '+err);
        } else {
            res.send('Author with id = ' + id + ' was updated');
        }
    });
};

//Delete
exports.removeBook = (req, res) => {
    const id = req.params.id;
    sql.connection.query(queries.removeBookQuery, [id], (err) => {
        if (err) {
            res.send('Querry error: '+err);
        } else {
            res.send('Book with id = ' + id + ' was removed');
        }
    });
};

exports.removeAuthor = (req, res) => {
    const id = req.params.id;
    sql.connection.query(queries.removeAuthorQuery, [id], (err) => {
        if (err) {
            res.send('Querry error: '+err);
        } else {
            res.send('Author with id = ' + id + ' was removed');
        }
    });
};