const mysql = require('mysql');
const connectionData = require('../configs/MySQL').connectionData;

const connection = mysql.createConnection(connectionData);
exports.connection = connection;

exports.startConnection = () => {
    connection.connect(err => {
        if (err) {
            //test
            console.log(err);
        } else {
            console.log('MySQL database connected');
        }
    });
};

exports.endConnection = () => {
    connection.end(err => {
        if (err) {
            console.log(err)
        } else {
            console.log('MySQL database disconected');
        }

    });
};
