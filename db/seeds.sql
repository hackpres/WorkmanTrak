INSERT INTO departments (id, department_name)
VALUES  (1, "Engineering"),
        (2, "Finance"),
        (3, "Legal"),
        (4, "Sales");

INSERT INTO roles (id, role_title, role_salary, department_id)
VALUES  (1, "Sales Lead", 100000, 4),
        (2, "Salesperson", 80000, 4),
        (3, "Lead Engineer", 150000, 1),
        (4, "Software Engineer", 120000, 1),
        (5, "Account Manager", 160000, 2),
        (6, "Accountant", 125000, 2),
        (7, "Legal Team Lead", 250000, 3),
        (8, "Lawyer", 190000, 3);

INSERT INTO employees (first_name, last_name, role_id, is_manager, manager)
VALUES  ("John", "Doe", 1, TRUE, NULL),
        ("Mike", "Chan", 2, FALSE, "John Doe"),
        ("Ashley", "Rodriguez", 3, TRUE, NULL),
        ("Kevin", "Tupik", 4, FALSE, "Ashley Rodriguez"),
        ("Kunal", "Singh", 5, TRUE, NULL),
        ("Malia", "Brown", 6, FALSE, "Kunal Singh"),
        ("Sarah", "Lourd", 7, TRUE, NULL),
        ("Tom", "Allen", 8, FALSE, "Sarah Lourd");