const mysql = require('mysql2');
const figlet = require('figlet');
const init = require('./app');

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

// Views

const viewEmployees = () => {
    connection.query(`SELECT employees.employee_id, employees.first_name, employees.last_name, roles.role_title, departments.department_name, roles.role_salary, employees.manager 
        FROM departments 
        JOIN roles ON departments.id = roles.department_id 
        JOIN employees ON roles.id = employees.role_id;`,
        function (err, res) {
            if (err) {
                throw err;
            }
            console.table(res)
            init()
        }
    )
}


// module.exports = connection;
module.exports = {
    viewEmployees: viewEmployees()
}