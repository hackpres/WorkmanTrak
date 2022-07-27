const mysql = require('mysql2');
const figlet = require('figlet');
const init = require('../index');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mysqlPassword',
    database: 'employees_db'
})

connection.connect((err) => {
    if (err) throw err;
    console.log(`Connected to employees_db on localhost port ${connection.port}`);
    figlet.text('WorkmanTrak', {
        font: 'ogre',
    }, function(err, data) {
        if (err) {
            console.log(`Figlet failed to render "WorkmanTrak" text.`);
            console.dir(err);
            return;
        }
        console.log('\x1b[36m');
        console.log(data);
        console.log('\x1b[0m');
        init();
    })
});

module.exports = connection;