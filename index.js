const inquirer = require('inquirer');
const mysql = require('mysql2');
const figlet = require('figlet');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mysqlPassword',
    database: 'employees_db'
})

connection.connect((err) => {
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



const choiceArray = [
    'View All Employees',
    'Add Employee',
    'Update Employee Role',
    'View All Roles',
    'Add Role',
    'View All Departments',
    'Add Department',
    'Exit WorkmanTrak'
]

// initilization function

const init = async () => {
    const answer = await inquirer.prompt({
        name: 'initChoice',
        type: 'list',
        message: 'What would you like to do?',
        choices: choiceArray
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

let deptChoices = [];
let roleChoices = [];
let manRoleChoices = [];
let managerChoices = [];
let fullNames = [];
let selectedName = [];
let selectedFirst;
let selectedLast;
let selectedNameID = [];

// Convenience Functions

function uniqueDepts() {
    connection.query(`SELECT department_name FROM departments`,
        function (err, res) {
            if (err) throw err;
            res.map(depts => deptChoices.push(depts.department_name));
        }
    )
}
uniqueDepts();
function uniqueRoles() {
    connection.query(`SELECT role_title FROM roles`,
        function (err, res) {
            if (err) throw err;
            res.map(roles => roleChoices.push(roles.role_title));
        }
    )
}
uniqueRoles();
function UniqueManRoles() {
    connection.query(`
        SELECT role_title
        FROM employees
        LEFT JOIN roles ON employees.role_id = roles.id
        WHERE employees.employee_id IN (SELECT employees.manager_id FROM employees)`,
        function (err, res) {
            if (err) throw err;
            res.map(roles => manRoleChoices.push(roles.role_title));
        })
}
UniqueManRoles();
function uniqueManagers() {
    connection.query(`
        SELECT e.employee_id AS Emp_ID, e.first_name AS Employee_first, e.last_name AS Employee_last, m.role_id AS Mgr_id, m.first_name AS Manager_first, m.last_name AS Manager_last
        FROM employees e
        JOIN employees m 
        ON (e.manager_id = m.employee_id);`,
        function (err, res) {
            if (err) throw err; 
            let managersFirst = res.map(manager => manager.Manager_first);
            let managersLast = res.map(manager => manager.Manager_last);
            let managersFull = [];
            managersFirst.map((name, i) => {
                managersFull.push(`${name} ${managersLast[i]}`)
            })
            managersFull.forEach((name) => {
                if (!managerChoices.includes(name)) {
                    managerChoices.push(name);
                }
            })
            managerChoices.unshift('None');
        }
    )
}
uniqueManagers();
function getFullNames() {
    connection.query(`
        SELECT employees.role_id, roles.role_title, employees.first_name, employees.last_name, employees.manager_id
        FROM roles
        JOIN employees ON roles.id = employees.role_id
        ORDER BY role_id;`,
        function (err, res) {
            if (err) throw err;
            let employeeFirstNames = res.map(first => first.first_name);
            let employeeLastNames = res.map(last => last.last_name);
            employeeFirstNames.map((name, i) => {
                fullNames.push(`${name} ${employeeLastNames[i]}`)
            })
        }
    )
}
getFullNames();
function getSelectedFullnameID(fullname) {
    selectedName = fullname.split(' ');
    selectedFirst = checkedName[0];
    selectedLast = checkedName[1];
    connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
        [{ first_name: selectedFirst },
        { last_name: selectedLast }],
        function (err, res) {
            if (err) throw err;
            selectedNameID = res[0].role_id;
        }
    )
}

// Views

const viewEmployees = () => {
    connection.query(`
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
const viewRoles = () => {
    connection.query(`
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
const viewDepts = () => {
    connection.query(`
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

const addEmployee = () => {
    inquirer.prompt([
        {
            name: 'employeeFirst',
            type: 'input',
            message: `What is the employee's first name?`,
            validate: (input) => {
                if (input === '' || input === ' ') {
                    console.log('\x1b[31m');
                    console.log(`Employee first name is required.`);
                    console.log('\x1b[0m');
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
                    console.log('\x1b[31m');
                    console.log(`Employee last name is required.`);
                    console.log('\x1b[0m');
                } else {
                    return true;
                }
            }
        },
        {
            name: `employeeRole`,
            type: `list`,
            message: `What is the employee's role?`,
            choices: roleChoices
        },
        {
            name: `manager`,
            type: 'list',
            message: `Who is the employee's manager?`,
            choices: managerChoices
        }]
        ).then(results => {
            connection.query(
                'INSERT INTO employees SET ?;',
                {
                    first_name: results.employeeFirst,
                    last_name: results.employeeLast,
                }
            )
            connection.query(`
                SELECT role_title, id
                FROM roles
                WHERE ?`,
            { role_title: results.employeeRole },
                function(err, res) {
                    if (err) {
                        throw err;
                    }
                    let checkedID = res[0].id
                    connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                        [{ role_id: checkedID },
                        { first_name: results.employeeFirst },
                        { last_name: results.employeeLast }]
                    )
                }
            )
            if (results.manager === 'None') {
                connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                    [{
                        manager_id: null
                    },
                    { first_name: results.employeeFirst },
                    { last_name: results.employeeLast }]
                )
                console.log('\x1b[33m');
                console.log(`${results.employeeFirst} ${results.employeeLast} add as a ${results.employeeRole}`);
                console.log('\x1b[0m');
                managerChoices = [];
                uniqueManagers();
                init();
            } else {
                let manager = results.manager.split(" ");
                let managerFirst = manager[0];
                let managerLast = manager[1];
                let selectedManagerID;
                connection.query(`SELECT * FROM employees WHERE ? AND ?`,
                    [{ first_name: managerFirst },
                    { last_name: managerLast }],
                    function (err, res) {
                        if (err) throw err;
                        selectedManagerID = res[0].role_id
                    connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                        [{ manager_id: selectedManagerID },
                        { first_name: results.employeeFirst },
                        { last_name: results.employeeLast }]
                    )
                    console.log('\x1b[33m');
                    console.log(`${results.employeeFirst} ${results.employeeLast} added as a ${results.employeeRole} reporting to ${results.manager}`);
                    console.log('\x1b[0m');
                    managerChoices = [];
                    uniqueManagers();
                    init();
                    }
                )
            }
        }
    )
};
const addRole = () => {
    inquirer.prompt([
        {
            name: `newRole`,
            type: `input`,
            message: `What is the name of the new role?`
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
            choices: deptChoices
        }]
        ).then(results => {
            connection.query(
                `SELECT departments.department_name, departments.id
                FROM departments
                WHERE ?`,
            { department_name: results.department },
                function(err, res) {
                    if (err) throw err;
                    let checkedID = res[0].id
                    connection.query(`
                        INSERT INTO roles SET ?`,
                        {
                            role_title: results.newRole,
                            role_salary: results.salary,
                            department_id: checkedID
                        }
                    )
                    console.log('\x1b[33m');
                    console.log(`${results.newRole} add under department: ${results.department}`);
                    console.log('\x1b[0m');
                    roleChoices = [];
                    uniqueRoles();
                    init();
                }
            )
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
        connection.query(`
            INSERT INTO departments SET ?`,
            { department_name: results.newDept }
        )
        console.log('\x1b[33m');
        console.log(`${results.newDept} added to departments.`);
        console.log('\x1b[0m');
        deptChoices.push(results.newDept);
        init();
    })
}

//  Updates

const updateRoles = () => {
    inquirer.prompt([
        {
            name: `employee`,
            type: `list`,
            message: `Which employee's role do you want to update?`,
            choices: fullNames
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
            choices: managerChoices,
            when: function( answers ) {
                return !!answers.isManager;
            }
        },
        {
            name: `newRole`,
            type: `list`,
            message: `Which role would you like to assign to the selected employee?`,
            choices: roleChoices
        }]
    ).then(results => {
        let checkedName = results.employee.split(' ')
        let checkedFirst = checkedName[0];
        let checkedLast = checkedName[1];
        let selectedManagerID;
        connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
            [{ first_name: checkedFirst },
            { last_name: checkedLast }],
            function (err, res) {
                if (err) throw err;
                selectedManagerID = res[0].role_id;
                if (results.isManager) {
                    connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                        [{ manager_id: selectedManagerID },
                        { first_name: checkedFirst},
                        { last_name: checkedLast }]
                    )
                }
                connection.query(`
                    SELECT role_title, id
                    FROM roles
                    WHERE ?`,
                    { role_title: results.newRole },
                    function(err, res) {
                        if (err) throw err;
                        let checkedID = res[0].id
                        connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                            [{ role_id: checkedID },
                            { first_name: checkedFirst },
                            { last_name: checkedLast }]
                        )
                        console.log('\x1b[33m');
                        console.log(`New role ${results.newRole} confirmed for ${checkedFirst} ${checkedLast}.`);
                        console.log('\x1b[0m');
                        if (results.manager !== 'None') {
                            let selectedManagerID;
                            connection.query(`SELECT * FROM employees WHERE ? AND ?`,
                                [{ first_name: results.employeeFirst },
                                { last_name: results.employeeLast}],
                                function (err, res) {
                                    if (err) throw err;
                                    selectedManagerID = res.role_id
                                }
                            )
                            connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                                [{ manager_id: selectedManagerID },
                                { first_name: checkedFirst },
                                { last_name: checkedLast }]
                            )
                            init();
                        } else {
                            connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                                [{ manager_id: null },
                                { first_name: results.employeeFirst },
                                { last_name: results.employeeLast }]
                            )
                            init();
                        }
                    }
                )
            }
        )
    })
};
//     //***BONUS
const updateManagers = () => {
    inquirer.prompt([
        {
            name: `selectedManager`,
            type: `list`,
            message: `Which manager would you like to update?`,
            choices: managerChoices
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
            choices: managerChoices,
            when: function( answers ) {
                return !!answers.isManager;
            }
        },
        {
            name: `role`,
            type: `list`,
            message: `What is this managers role?`,
            choices: manRoleChoices
        }]
    ).then(results => {
        let nameResult = results.selectedManager;
        let newRoleID;
        getSelectedFullnameID(nameResult);
        connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
            [{ first_name: selectedFirst },
            { last_name: selectedLast }],
            function (err, res) {
                if (err) throw err;
                selectedName = [];
                selectedFirst;
                selectedLast;
                selectedNameID = [];
                
            })
                // if (results.isManager) {
                //     let checkedManager = results.manager.split(' ');
                //     let checkedManagerFirst = checkedManager[0];
                //     let checkedManagerLast = checkedManager[1];
                //     let checkedManagerID;
                //     connection.query(`SELECT * FROM employees WHERE ? AND ?;`,
                //     [{ first_name: checkedManagerFirst },
                //     { last_name: checkedManagerLast }],
                //     function (err, res) {
                //         if (err) throw err;
                //         checkedManagerID = res[0].role_id;
                //     })
                //     connection.query(`UPDATE employees SET ? WHERE ? AND ?;`,
                //         [{ manager_id: selectedManagerID },
                //         { first_name: checkedFirst},
                //         { last_name: checkedLast }]
                //     )
                // } else {

                // }
        }
    )
}
