INSERT INTO departments (department_name)
VALUES  ("Engineering"),
        ("Finance"),
        ("Legal"),
        ("Sales"),
        ("Upper Management");

INSERT INTO roles (id, role_title, role_salary, department_id)
VALUES  (1, "CEO", 290000, 5),
        (2, "Sales Lead", 100000, 4),
        (3, "Salesperson", 80000, 4),
        (4, "Lead Engineer", 150000, 1),
        (5, "Software Engineer", 120000, 1),
        (6, "Account Manager", 160000, 2),
        (7, "Accountant", 125000, 2),
        (8, "Legal Team Lead", 250000, 3),
        (9, "Lawyer", 190000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ("Becca", "Mitchell", 1, null),
        ("John", "Doe", 2, 1),
        ("Mike", "Chan", 3, 2),
        ("Ashley", "Rodriguez", 4, 1),
        ("Kevin", "Tupik", 5, 4),
        ("Kunal", "Singh", 6, 1),
        ("Malia", "Brown", 7, 6),
        ("Sarah", "Lourd", 8, 1),
        ("Tom", "Allen", 9, 8);