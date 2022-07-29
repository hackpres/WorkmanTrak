const inquirer = require('inquirer');
const mysql = require('mysql2');
const figlet = require('figlet');
const { check } = require('prettier');

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

function init() {
    inquirer.prompt({
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
            'Quit'
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
            case 'Quit':
                inquirer.prompt({
                    name: 'quit',
                    type: 'confirm',
                    message: 'Are you sure you want to quit?'
                }).then(results => {
                    if (results.quit === true) {
                        process.exit(0);
                    } else {
                        init();
                    }
                });
                break;
        }
    })
}

// Views

const viewEmployees = () => {
    connection.query(`
        SELECT employees.employee_id, employees.first_name, employees.last_name, roles.role_title, departments.department_name, roles.role_salary, employees.manager 
        FROM departments 
        JOIN roles ON departments.id = roles.department_id 
        JOIN employees ON roles.id = employees.role_id
        ORDER BY employee_id;`,
        function (err, res) {
            if (err) {
                throw err;
            }
            console.table(res);
            init();
        }
    )
}
const viewRoles = () => {
    connection.query(`
    SELECT departments.id, roles.role_title AS title, departments.department_name AS department, roles.role_salary AS salary
    FROM departments
    JOIN roles ON departments.id = roles.department_id
    ORDER BY departments.id;`,
    function (err, res) {
        if (err) {
            throw err;
        }
        console.table(res);
        init();
    })
}

// Adds

const addEmployee = () => {
    connection.query(
        `SELECT roles.id, roles.role_title, employees.is_manager, employees.manager, employees.first_name, employees.last_name
        FROM roles
        JOIN employees ON roles.id = employees.role_id;`,
        function (err, res) {
            if (err) {
                throw err;
            }
            function uniqRoles() {
                    //confirms that roles don't return duplicates when 2 or more employees have the same role.
                let rolesFromDB = res.map(roles => roles.role_title);
                let uniqRoles = rolesFromDB.filter((element, index) => {
                    return rolesFromDB.indexOf(element) === index;
                });
                return uniqRoles
            }
            function uniqManagers() {
                //confirms that managers don't return duplicates when 2 or more employees have the same manager.
            let managersFromDB = res.filter(roles => roles.is_manager !== 0);
            let managersFirst = managersFromDB.map(manager => manager.first_name);
            let managersLast = managersFromDB.map(manager => manager.last_name);
            let managersFull = [];
            managersFirst.map((name, i) => {
                managersFull.push(`${name} ${managersLast[i]}`)
            })
            return managersFull
        }
            inquirer.prompt([
                {
                    name: 'employeeFirst',
                    type: 'input',
                    message: `What is the employee's first name?`,
                    validate: (input) => {
                        if (input === '' || input === ' ') {
                            console.log(`Employee first name is required.`);
                        } else {
                            return true;
                        }
                    }
                },
                {
                    name: `employeeLast`,
                    type: `input`,
                    message: `What is the employee's last name?`,
                    validate: (input) => {
                        if (input === '' || input === ' ') {
                            console.log(`Employee last name is required.`);
                        } else {
                            return true;
                        }
                    }
                },
                {
                    name: `employeeRole`,
                    type: `list`,
                    message: `What is the employee's role?`,
                    choices: uniqRoles()
                },
                {
                    name: `manager`,
                    type: 'list',
                    message: `Who is the employee's manager?`,
                    choices: uniqManagers()
                }]
                ).then(results => {
                    connection.query(
                        'INSERT INTO employees SET ?;',
                        {
                            first_name: results.employeeFirst,
                            last_name: results.employeeLast,
                        }
                    )
                    connection.query(
                        `SELECT role_title, id
                        FROM roles
                        WHERE ?`,
                    { role_title: results.employeeRole },
                        function(err, res) {
                            if (err) {
                                throw err;
                            }
                            let checkedID = res[0].id
                            connection.query(
                                `UPDATE employees SET ? WHERE ? AND ?;`,
                                [{ role_id: checkedID },
                                { first_name: results.employeeFirst },
                                { last_name: results.employeeLast }]
                            )
                        }
                    )
                    if (results.manager !== 'None') {
                        connection.query(
                            `UPDATE employees SET ? WHERE ? AND ?;`,
                            [{
                                manager: results.manager,
                                is_manager: false
                            },
                            { first_name: results.employeeFirst },
                            { last_name: results.employeeLast }]
                        )
                        console.log(`${results.employeeFirst} ${results.employeeLast} added as a ${results.employeeRole} reporting to ${results.manager}`);
                        init();
                    } else {
                        connection.query(
                            `UPDATE employees SET ? WHERE ? AND ?;`,
                            [{
                                is_manager: true,
                                manager: null
                            },
                            { first_name: results.employeeFirst },
                            { last_name: results.employeeLast }]
                        )
                        console.log(`${results.employeeFirst} ${results.employeeLast} add as a ${results.employeeRole}`);
                        init();
                    }
                }
            )
        }
)};

//  Updates

const updateRoles = () => {
    connection.query(
        `SELECT employees.role_id, roles.role_title, employees.first_name, employees.last_name, employees.is_manager, employees.manager
        FROM roles
        JOIN employees ON roles.id = employees.role_id
        ORDER BY role_id;`,
        function (err, res) {
            if (err) {
                throw err;
            }
            let employeeFirstNames = res.map(first => first.first_name);
            let employeeLastNames = res.map(last => last.last_name);
            let employeeFullNames = [];
            employeeFirstNames.map((name, i) => {
                employeeFullNames.push(`${name} ${employeeLastNames[i]}`)
            })
            function uniqRoles() {
                    //confirms that roles don't return duplicates when 2 or more employees have the same role.
                let employeeRoles = res.map(roles => roles.role_title);
                let uniqRoles = employeeRoles.filter((role, i) => {
                    return employeeRoles.indexOf(role) === i;
                });
                return uniqRoles
            }
            function uniqManagers() {
                    //confirms that managers don't return duplicates when 2 or more employees have the same manager.
                let managersFromDB = res.filter(roles => roles.is_manager !== 0);
                let managersFirst = managersFromDB.map(manager => manager.first_name);
                let managersLast = managersFromDB.map(manager => manager.last_name);
                let managersFull = [];
                managersFirst.map((name, i) => {
                    managersFull.push(`${name} ${managersLast[i]}`)
                })
                return managersFull
            }
            inquirer.prompt([
                {
                    name: `employee`,
                    type: `list`,
                    message: `Which employee's role do you want to update?`,
                    choices: employeeFullNames
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
                    choices: uniqManagers(),
                    when: function( answers ) {
                        return !!answers.isManager;
                    }
                },
                {
                    name: `newRole`,
                    type: `list`,
                    message: `Which role would you like to assign to the selected employee?`,
                    choices: uniqRoles()
                }]
            ).then(results => {
                let checkedName = results.employee.split(' ')
                let checkedFirst = checkedName[0];
                let checkedLast = checkedName[1];
                if (results.isManager) {
                    connection.query(`
                        UPDATE employees SET manager = 'no manager' WHERE ?;`,
                        { manager: results.employee },
                        function(err, res) {
                            if (err) {
                                throw err;
                            }
                        }
                    )
                }
                connection.query(
                    `SELECT role_title, id
                    FROM roles
                    WHERE ?`,
                    { role_title: results.newRole },
                    function(err, res) {
                        if (err) {
                            throw err;
                        }
                        let checkedID = res[0].id
                        connection.query(
                            `UPDATE employees SET ? WHERE ? AND ?;`,
                            [{ role_id: checkedID },
                            { first_name: checkedFirst },
                            { last_name: checkedLast }],
                            function (err) { if (err) { throw err; } }
                        )
                        console.log(`New role ${results.newRole} confirmed for ${checkedFirst} ${checkedLast}.`);

                        if (results.manager !== null) {
                            connection.query(
                                `UPDATE employees SET ? WHERE ? AND ?;`,
                                [{
                                    manager: results.manager,
                                    is_manager: false
                                },
                                { first_name: checkedFirst },
                                { last_name: checkedLast }]
                            )
                            init();
                        } else {
                            connection.query(
                                `UPDATE employees SET ? WHERE ? AND ?;`,
                                [{
                                    is_manager: true,
                                    manager: null
                                },
                                { first_name: checkedFirst },
                                { last_name: checkedLast }]
                            )
                            init();
                        }
                    }
                )
            })
        }
    )
};