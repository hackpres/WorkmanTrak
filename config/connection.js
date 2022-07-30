const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mysqlPassword',
    database: 'employees_db'
})

connection.connect();

connection.query = util.promisify(connection.query);

module.exports = connection;