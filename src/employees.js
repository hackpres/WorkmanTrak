// const init = require('../index');
// const mysql = require('mysql2');

// const connection = config.connection;
// const viewEmployees = () => {
//     connection.query(`SELECT employees.employee_id, employees.first_name, employees.last_name, roles.role_title, departments.department_name, roles.role_salary, employees.manager 
//         FROM departments 
//         JOIN roles ON departments.id = roles.department_id 
//         JOIN employees ON roles.id = employees.role_id;`,
//         function (err, res) {
//             if (err) {
//                 throw err;
//             }
//             console.table(res)
//             init()
//         }
//     )
// }

// module.exports = viewEmployees;