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
        if (this.establishedConnection === null) {
            this.establishedConnection = this.connection.connect(function(err, res) {
                if (err) {
                    db.dropConnection();
                    throw err;
                } else {
                    console.log('Connected to employees_db.');
                    init()
                }

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
        if (this.establishedConnection !== null) {
            this.connection.end();
            console.log('Disconnected from employees_db.')
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

db.connect((err) => {if (err) throw err;})

const init = () => {
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
        mainMenu();
    })
};

// mainMenu function

const mainMenu = async () => {
    const answer = await inquirer.prompt({
        name: 'Choice',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'Add Employee',
            'View Employees by manager',
            'Update Employee Role',
            'Update Manager Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            'Add Department',
            'View Employees by Department',
            'Exit WorkmanTrak'
        ]
    }).then(results => {
        switch (results.Choice) {
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'View Employees by manager':
                viewByManager();
                break;
            case 'Update Employee Role':
                updateRoles();
                break;
            case 'Update Manager Role':
                updateManagers();
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
            case 'View Employees by Department':
                viewByDept();
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
                db.dropConnection();
            } else {
                mainMenu();
            }
        }
    );
}

// Helper Functions

function validateString(input) {
    if ((input.trim() != "") && (input.trim().length <= 30)) {
        return true
    } else {
        console.log('\x1b[31m');
        console.log(`Please input a valid name fewer than 30 characters.`);
        console.log('\x1b[0m');
    }
}
const handleUnmanaged = async (name, id) => {
    let unmanaged = await db.query(`SELECT employee_id, CONCAT(first_name, " ", last_name) AS fullname FROM employees WHERE manager_id = ?`, [id]);
    let managerChoices = await db.query(`SELECT employee_id, CONCAT(first_name, " ", last_name) AS Manager FROM employees`);
    if (unmanaged.length != 0) {
        console.log('\x1b[31m', `Changing ${name}'s role potentially left one or more employees with an inaccurate manager.`, '\x1b[0m')
        inquirer.prompt([
            {
                name: 'confirm',
                type: 'confirm',
                message: `Would you like to update potentially unmanaged employees?`
            },
            {
                name: `employee`,
                type: `list`,
                message: `Which employee would you like to update?`,
                choices: unmanaged.map(name => name.fullname),
                when: function( answers ) {
                    return !!answers.confirm;
                }
            }
        ]).then(results => {
            if (results.confirm) {
                inquirer.prompt([
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
                    }
                ]).then(results2 => {
                    let unmanagedID = unmanaged.find(employee => employee.fullname === results.employee).employee_id;
                    let managerID = managerChoices.find(manager => manager.Manager === results2.manager).employee_id;
                    if (results2.manager != undefined) {
                        db.query(`UPDATE employees SET manager_id = ? WHERE employee_id = ?`, [managerID, unmanagedID]);
                        console.log('\x1b[33m', `${results.employee} now reporting to ${results2.manager}, '\x1b[0m'`);
                        handleUnmanaged(name, id);
                    }
                })
            } else {
                mainMenu();
            }
        })
    } else {
        mainMenu();
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
            mainMenu();
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
            mainMenu();
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
            mainMenu();
        }
    )
}
    //***Bonus
const viewByManager = async () => {
    let managers = await db.query(`SELECT DISTINCT m.role_id AS Mgr_id, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employees e JOIN employees m WHERE e.manager_id IN (m.employee_id);`)
    inquirer.prompt([
        {
            name: `manager`,
            type: `list`,
            message: `View employees under which manager?`,
            choices: managers.map(name => name.Manager)
        }
    ]).then( async results => {
        let managerID = managers.find(name => name.Manager === results.manager).Mgr_id;
        let employees = await db.query(`SELECT employee_id, CONCAT(first_name, " ", last_name) AS fullname FROM employees WHERE manager_id = ?`, [managerID]);
        console.table(employees);
        mainMenu();
    });
}
    //***Bonus
const viewByDept = async () => {
    let depts = await db.query(`SELECT * FROM departments ORDER BY departments.id;`);
    inquirer.prompt([
        {
            name: `dept`,
            type: `list`,
            message: `View employees from which department?`,
            choices: depts.map(dept => dept.department_name)
        }
    ]).then( async results => {
        let employees = await db.query(`
        SELECT employee_id AS ID, CONCAT(first_name, " ", last_name) AS Employee, role_title AS Title
        FROM departments
        JOIN roles ON departments.id = roles.department_id
        JOIN employees ON roles.id = employees.role_id
        WHERE department_name = ?;`, [results.dept]);
        console.table(employees);
        mainMenu();
    })
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
                mainMenu()
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
                mainMenu()
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
            mainMenu()
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
        mainMenu();
    })
}

//  Updates

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
                mainMenu();
            } else {
                db.query(`UPDATE employees SET role_id = ?, manager_id = null WHERE ?`, [roleID, empID]);
                console.log('\x1b[33m', `New role ${results.newRole} confirmed for ${results.employee}., '\x1b[0m'`);
                mainMenu();
            }
        } else {
            mainMenu()
        }
    })
}

     //***BONUS
const updateManagers = async () => {
    let managerChoices = await db.query(`SELECT DISTINCT m.role_id AS Mgr_id, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employees e JOIN employees m WHERE e.manager_id IN (m.employee_id);`);
    managerChoices.push({ Mgr_id: null, Manager: 'Cancel' });
    let empChoices = await db.query(`SELECT employee_id, CONCAT(first_name, " ", last_name) AS fullname FROM employees`);
    let roleChoices = await db.query(`SELECT id, role_title FROM roles;`);
    inquirer.prompt([
        {
            name: `selectedManager`,
            type: `list`,
            message: `Which manager would you like to update?`,
            choices: managerChoices.map(name => name.Manager)
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
            choices: empChoices.map(name => name.fullname),
            when: function( answers ) {
                return !!answers.isManager;
            }
        },
        {
            name: `role`,
            type: `list`,
            message: `What is this managers role?`,
            choices: roleChoices.map(role => role.role_title)
        }]
    ).then(results => {
        if (results.selectedManager != 'Cancel') {
            let empID = managerChoices.find(name => name.Manager === results.selectedManager).Mgr_id;
            let managerID = empChoices.find(manager => manager.fullname === results.manager).employee_id;
            let roleID = roleChoices.find(role => role.role_title === results.role).id;
            if (results.manager != undefined) {
                db.query(`UPDATE employees SET role_id = ?, manager_id = ? WHERE employee_id = ?`, [roleID, managerID, empID]);
                console.log('\x1b[33m', `New role ${results.role} confirmed for ${results.selectedManager}., '\x1b[0m'`);
                handleUnmanaged(results.selectedManager, empID);
            } else {
                db.query(`UPDATE employees SET role_id = ?, manager_id = null WHERE ?`, [roleID, empID]);
                console.log('\x1b[33m', `New role ${results.role} confirmed for ${results.selectedManager}., '\x1b[0m'`);
                handleUnmanaged(results.selectedManager, empID);
            }
            
        } else {
            mainMenu()
        }
    })
}
