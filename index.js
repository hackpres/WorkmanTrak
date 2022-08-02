const inquirer = require('inquirer');
const mysql = require('mysql2');
const figlet = require('figlet');
const { validate } = require('uuid');

class  Database {
    constructor(config) {
        this.establishedConnection = null;
        this.connection = mysql.createConnection(config);
    }

    connect() {
        if (!this.establishedConnection) {
            this.establishedConnection = this.connection.connect(function(err) {
                if (err) {
                    this.dropConnection();
                    throw err;
                }
                console.log(res.state, 'Connected to employees_db.')
                return this.connection
            });
        };
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    dropConnection() {
        if (this.establishedConnection) {
            this.establishedConnection.then(res => {
                res.end();
                console.log(res.state, 'Disconnected from employees_db.')
            });
            this.establishedConnection = null;
        };
    }
}

const db = new Database({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mysqlPassword',
    database: 'employees_db'
})

// const connection = mysql.createConnection({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: 'mysqlPassword',
//     database: 'employees_db'
// })

db.connection.connect((err) => {
    if (err) throw err;
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


// initilization function

const init = async () => {
    const answer = await inquirer.prompt({
        name: 'initChoice',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'Add Employee',
            'Update Employee Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            'Add Department',
            'Exit WorkmanTrak'
        ]
    }).then(results => {
        switch (results.initChoice) {
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateRoles();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewDepts();
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Exit WorkmanTrak':
                quit();
                break;
        }
    })
}

const quit = () => {
    inquirer.prompt(
        {
        name: 'quit',
        type: 'confirm',
        message: 'Are you sure you want to quit?'
        }).then(results => {
            if (results.quit === true) {
                process.exit(0);
            } else {
                init();
            }
        }
    );
}

// Convenience Arrays

// let deptChoices = uniqueDepts();
// let roleChoices = connection.query(`SELECT role_title FROM roles;`);
// let empChoices = uniqueEmployees();
// let manRoleChoices = UniqueManRoles();
// let managerChoices = uniqueManagers();
// let fullNames = getFullNames();

// Convenience Functions

// async function uniqueDepts() {
//     await connection.query(`SELECT department_name FROM departments;`,
//         function (err, res) {
//             if (err) throw err;
//             return res.map(depts => depts.department_name);
//         }
//     )
// }
// function uniqueRoles() {
//     connection.query(`SELECT role_title FROM roles;`,
//         function (err, res) {
//             if (err) throw err;
//             return res
//         }
//     )
// }
// function uniqueEmployees() {
//     connection.query(`SELECT first_name, last_name FROM employees;`,
//     function (err, res) {
//         if (err) throw err;
//         let Choices = [];
//         let full = [];
//         let first = [];
//         let last = [];
//         res.map(name => first.push(name.first_name));
//         res.map(name => last.push(name.last_name));
//         first.map((name, i) => {
//             full.push(`${name} ${last[i]}`)
//         })
//         full.forEach((name) => {
//             if (!Choices.includes(name)) {
//                 Choices.push(name);
//             }
//         })
//         return Choices
//     })
// }
// function UniqueManRoles() {
//     connection.query(`
//         SELECT role_title
//         FROM employees
//         LEFT JOIN roles ON employees.role_id = roles.id
//         WHERE employees.employee_id IN (SELECT employees.manager_id FROM employees);`,
//         function (err, res) {
//             if (err) throw err;
//             return res.map(roles => roles.role_title);
//         })
// }
// function uniqueManagers() {
//     connection.query(`
//         SELECT e.employee_id AS Emp_ID, e.first_name AS Employee_first, e.last_name AS Employee_last, m.role_id AS Mgr_id, m.first_name AS Manager_first, m.last_name AS Manager_last
//         FROM employees e
//         JOIN employees m 
//         ON (e.manager_id = m.employee_id);`,
//         function (err, res) {
//             if (err) throw err; 
//             let Choices = [];
//             let managersFirst = res.map(manager => manager.Manager_first);
//             let managersLast = res.map(manager => manager.Manager_last);
//             let managersFull = [];
//             managersFirst.map((name, i) => {
//                 managersFull.push(`${name} ${managersLast[i]}`)
//             })
//             managersFull.forEach((name) => {
//                 if (!Choices.includes(name)) {
//                     Choices.push(name);
//                 }
//             })
//             Choices.unshift('None');
//             return Choices
//         }
//     )
// }
// function getFullNames() {
//     connection.query(`
//         SELECT employees.role_id, roles.role_title, employees.first_name, employees.last_name, employees.manager_id
//         FROM roles
//         JOIN employees ON roles.id = employees.role_id;`,
//         function (err, res) {
//             if (err) throw err;
//             let fullnames = [];
//             let employeeFirstNames = res.map(first => first.first_name);
//             let employeeLastNames = res.map(last => last.last_name);
//             employeeFirstNames.map((name, i) => {
//                 fullnames.push(`${name} ${employeeLastNames[i]}`)
//             })
//             return fullnames
//         }
//     )
// }
// function getSelectedFullnameID(fullname) {
//     let selectedName = [];
//     let selectedFirst = [];
//     let selectedLast =[];
//     selectedName = fullname.split(' ');
//     selectedFirst = checkedName[0];
//     selectedLast = checkedName[1];
//     connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
//         [{ first_name: selectedFirst },
//         { last_name: selectedLast }],
//         function (err, res) {
//             if (err) throw err;
//             let nameID = res[0].role_id;
//             return nameID
//         }
//     )
// }
function validateString(input) {
    if ((input.trim() != "") && (input.trim().length <= 30)) {
        return true
    } else {
        console.log('\x1b[31m');
        console.log(`Please input a valid name fewer than 30 characters.`);
        console.log('\x1b[0m');
    }
}

// Views

const viewEmployees = async () => {
     await db.query(`
        SELECT employees.employee_id, employees.first_name, employees.last_name, roles.role_title, departments.department_name, roles.role_salary, employees.manager_id 
        FROM departments 
        JOIN roles ON departments.id = roles.department_id 
        JOIN employees ON roles.id = employees.role_id
        ORDER BY employee_id;`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        }
    )
}
const viewRoles = async () => {
    await db.query(`
        SELECT departments.id AS id, roles.role_title AS title, departments.department_name AS department, roles.role_salary AS salary
        FROM departments
        JOIN roles ON departments.id = roles.department_id
        ORDER BY departments.id`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        }
    )
}
const viewDepts = async () => {
    await db.query(`
        SELECT *
        FROM departments
        ORDER BY departments.id;`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        }
    )
}

// Adds

const addEmployee = async () => {
    let roleChoices = await db.query(`SELECT id, role_title FROM roles;`);
    let managerChoices = await db.query(`SELECT employee_id, CONCAT(first_name, " ", last_name) AS Manager FROM employees`);
    let managers = JSON.parse(JSON.stringify(managerChoices.map(name => name.Manager)));
    managers.unshift('None');
    inquirer.prompt([
        {
            name: 'employeeFirst',
            type: 'input',
            message: `What is the employee's first name?`,
            validate: validateString
        },
        {
            name: `employeeLast`,
            type: `input`,
            message: `What is the employee's last name?`,
            validate: validateString
        },
        {
            name: `employeeRole`,
            type: `list`,
            message: `What is the employee's role?`,
            choices: roleChoices.map(role => role.role_title)
        },
        {
            name: `manager`,
            type: 'list',
            message: `Who is the employee's manager?`,
            choices: managers
        }]
        ).then(results => {
            let positionRole = roleChoices.find(employee => employee.role_title === results.employeeRole);
            let positionManager = managerChoices.find(manager => manager.Manager === results.manager);
            if (results.manager === undefined) {
                db.query('INSERT INTO employees SET ?;',
                    {
                        first_name: results.employeeFirst.trim(),
                        last_name: results.employeeLast.trim(),
                        role_id: positionRole.id,
                        manager_id: null
                    }
                )
                console.log('\x1b[33m', `${results.employeeFirst} ${results.employeeLast} add as a ${results.employeeRole}`, '\x1b[0m');
                init()
            } else {
                db.query('INSERT INTO employees SET ?;',
                    {
                        first_name: results.employeeFirst.trim(),
                        last_name: results.employeeLast.trim(),
                        role_id: positionRole.id,
                        manager_id: positionManager.employee_id
                    }
                )
                console.log('\x1b[33m', `${results.employeeFirst} ${results.employeeLast} added as a ${results.employeeRole} reporting to ${results.manager}`, '\x1b[0m');
                init()
            }
        }
    )
};
const addRole = async () => {
    let deptChoices = await db.query(`SELECT * FROM departments`);
    inquirer.prompt([
        {
            name: `newRole`,
            type: `input`,
            message: `What is the name of the new role?`,
            validate: validateString
        },
        {
            name: `salary`,
            type: `input`,
            message: `What is the salary of the new role?`,
            validate: (answer) => {
                let regex = /^[0-9]+$/;
                if (regex.test(answer)) {
                    return true
                } else {
                    console.log('\x1b[31m');
                    return console.log(`Please enter a numerical value for employee salary, ommitting comma(s).`, `\x1b[0m`)
                }
            }
        },
        {
            name: `department`,
            type: `list`,
            message: `Which department does the new role belong to?`,
            choices: deptChoices.map(dept => dept.department_name)
        }]
        ).then(results => {
            let deptID = deptChoices.find(dept => dept.department_name === results.department).id;
            db.query(`INSERT INTO roles SET ?`,
                {
                    role_title: results.newRole,
                    role_salary: results.salary,
                    department_id: deptID
                }
            )
            console.log('\x1b[33m', `${results.newRole} add under department: ${results.department}`, '\x1b[0m');
            init()
        }
    )
}
const addDept = () => {
    inquirer.prompt([
        {
            name: `newDept`,
            type: `input`,
            message: `What is the name of the department?`
        }]
    ).then(results => {
        db.query(`INSERT INTO departments SET ?`,
            { department_name: results.newDept }
        )
        console.log('\x1b[33m', `${results.newDept} added to departments.`, '\x1b[0m');
        init();
    })
}

// //  Updates

const updateRoles = async () => {
    let empChoices = await db.query(`SELECT employee_id, CONCAT(first_name, " ", last_name) AS fullname FROM employees`);
    empChoices.push({ employee_id: null, fullname: 'Cancel' });
    let managerChoices = await db.query(`SELECT employee_id, CONCAT(first_name, " ", last_name) AS Manager FROM employees`);
    let roleChoices = await db.query(`SELECT id, role_title FROM roles;`);
    inquirer.prompt([
        {
            name: `employee`,
            type: `list`,
            message: `Which employee would you like to update?`,
            choices: empChoices.map(name => name.fullname)
        },
        {
            name: `isManager`,
            type: `confirm`,
            message: `Does the employee work under a manager?`,
            default: true
        },
        {
            name: `manager`,
            type: `list`,
            message: `Who is the manager for this employee's new role?`,
            choices: managerChoices.map(name => name.Manager),
            when: function( answers ) {
                return !!answers.isManager;
            }
        },
        {
            name: `newRole`,
            type: `list`,
            message: `Which role would you like to assign to the selected employee?`,
            choices: roleChoices.map(role => role.role_title)
        }]
    ).then(results => {
        if (results.employee != 'Cancel') {
            let empID = empChoices.find(name => name.fullname === results.employee).employee_id;
            let managerID = managerChoices.find(manager => manager.Manager === results.manager).employee_id;
            let roleID = roleChoices.find(role => role.role_title === results.newRole).id;
            if (results.manager != undefined) {
                db.query(`UPDATE employees SET role_id = ?, manager_id = ? WHERE employee_id = ?`, [roleID, managerID, empID]);
                console.log('\x1b[33m', `New role ${results.newRole} confirmed for ${results.employee}., '\x1b[0m'`);
                init();
            } else {
                db.query(`UPDATE employees SET role_id = ?, manager_id = null WHERE ?`, [roleID, empID]);
                console.log('\x1b[33m', `New role ${results.newRole} confirmed for ${results.employee}., '\x1b[0m'`);
                init();
            }
        } else {
            init()
        }
    })
}
//         let checkedName = results.employee.split(' ')
//         let checkedFirst = checkedName[0];
//         let checkedLast = checkedName[1];
//         let selectedManagerID;
//         connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
//             [{ first_name: checkedFirst },
//             { last_name: checkedLast }],
//             function (err, res) {
//                 if (err) throw err;
//                 selectedManagerID = res[0].role_id;
//                 if (results.isManager) {
//                     connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
//                         [{ manager_id: selectedManagerID },
//                         { first_name: checkedFirst},
//                         { last_name: checkedLast }]
//                     )
//                 }
//                 connection.query(`
//                     SELECT role_title, id
//                     FROM roles
//                     WHERE ?`,
//                     { role_title: results.newRole },
//                     function(err, res) {
//                         if (err) throw err;
//                         let checkedID = res[0].id
//                         connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
//                             [{ role_id: checkedID },
//                             { first_name: checkedFirst },
//                             { last_name: checkedLast }]
//                         )
//                         console.log();
//                         console.log('\x1b[33m', `New role ${results.newRole} confirmed for ${checkedFirst} ${checkedLast}., '\x1b[0m'`);
//                         console.log();
//                         if (results.manager !== 'None') {
//                             let selectedManagerID;
//                             connection.query(`SELECT * FROM employees WHERE ? AND ?`,
//                                 [{ first_name: results.employeeFirst },
//                                 { last_name: results.employeeLast}],
//                                 function (err, res) {
//                                     if (err) throw err;
//                                     selectedManagerID = res.role_id
//                                 }
//                             )
//                             connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
//                                 [{ manager_id: selectedManagerID },
//                                 { first_name: checkedFirst },
//                                 { last_name: checkedLast }]
//                             )
//                             init();
//                         } else {
//                             connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
//                                 [{ manager_id: null },
//                                 { first_name: results.employeeFirst },
//                                 { last_name: results.employeeLast }]
//                             )
//                             init();
//                         }
//                     }
//                 )
//             }
//         )
//     })
// };

// //     //***BONUS
// const updateManagers = () => {
//     inquirer.prompt([
//         {
//             name: `selectedManager`,
//             type: `list`,
//             message: `Which manager would you like to update?`,
//             choices: managerChoices
//         },
//         {
//             name: `isManager`,
//             type: `confirm`,
//             message: `Does the employee work under a manager?`,
//             default: true
//         },
//         {
//             name: `manager`,
//             type: `list`,
//             message: `Who is the manager for this employee's new role?`,
//             choices: managerChoices,
//             when: function( answers ) {
//                 return !!answers.isManager;
//             }
//         },
//         {
//             name: `role`,
//             type: `list`,
//             message: `What is this managers role?`,
//             choices: manRoleChoices
//         }]
//     ).then(results => {
//         let nameResult = results.selectedManager;
//         let newRoleID;
//         getSelectedFullnameID(nameResult);
//         connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
//             [{ first_name: selectedFirst },
//             { last_name: selectedLast }],
//             function (err, res) {
//                 if (err) throw err;
//                 selectedName = [];
//                 selectedFirst;
//                 selectedLast;
                
//             })
//                 // if (results.isManager) {
//                 //     let checkedManager = results.manager.split(' ');
//                 //     let checkedManagerFirst = checkedManager[0];
//                 //     let checkedManagerLast = checkedManager[1];
//                 //     let checkedManagerID;
//                 //     connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
//                 //     [{ first_name: checkedManagerFirst },
//                 //     { last_name: checkedManagerLast }],
//                 //     function (err, res) {
//                 //         if (err) throw err;
//                 //         checkedManagerID = res[0].role_id;
//                 //     })
//                 //         [{ manager_id: selectedManagerID },
//                 //         { first_name: checkedFirst},
//                 //         { last_name: checkedLast }]
//                 //     )
//                 // } else {

//                 // }
//         }
//     )
// }
