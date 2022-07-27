const inquirer = require('inquirer');

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

module.exports = init;