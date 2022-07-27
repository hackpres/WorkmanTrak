INSERT INTO department (id, department_name)
VALUES  (1, "Engineering"),
        (2, "Finance"),
        (3, "Legal"),
        (4, "Sales");

INSERT INTO roles (role_title, role_salary)
VALUES  ("Sales Lead", 100000),
        ("Salesperson", 80000),
        ("Lead Engineer", 150000),
        ("Software Engineer", 120000),
        ("Account Manager", 160000),
        ("Accountant", 125000),
        ("Legal Team Lead", 250000),
        ("Lawyer", 190000);

INSERT INTO employees (first_name, last_name, is_manager, manager)
VALUES  ("John", "Doe", TRUE, NULL),
        ("Mike", "Chan", FALSE, "John Doe"),
        ("Ashley", "Rodriguez", TRUE, NULL),
        ("Kevin", "Tupik", FALSE, "Ashley Rodriguez"),
        ("Kunal", "Singh", TRUE, NULL),
        ("Malia", "Brown", FALSE, "Kunal Singh"),
        ("Sarah", "Lourd", TRUE, NULL),
        ("Tom", "Allen", FALSE, "Sarah Lourd");