const path = require("path");
const express = require("express");
const xss = require("xss");
const EmployeesService = require("./employees-service");

const employeesRouter = express.Router();
const jsonParser = express.json();

const serializeEmployee = (i) => ({
  emp_id: i.emp_id,
  first_name: xss(i.first_name),
  last_name: xss(i.last_name),
  country: xss(i.country),
  dob: i.dob,
  age: i.age,
  date_modified: i.date_modified,
});

employeesRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    EmployeesService.getAllEmployees(knex)
      .then((employees) => {
        res.json(employees.map(serializeEmployee));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { first_name, last_name, country, dob, age } = req.body;
    const newEmployee = {
      first_name,
      last_name,
      country,
      dob,
      age,
    };
    const knex = req.app.get("db");

    for (const [key, value] of Object.entries(newEmployee)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    EmployeesService.insertEmployee(knex, newEmployee)
      .then((employee) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${employee.emp_id}`))
          .json(serializeEmployee(employee));
      })
      .catch(next);
  });

employeesRouter
  .route("/:emp_id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    EmployeesService.getById(knex, req.params.emp_id)
      .then((employee) => {
        if (!employee) {
          return res
            .status(404)
            .json({ error: { message: `Employee not found` } });
        }
        res.employee = employee;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => res.json(serializeEmployee(res.employee)))
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    EmployeesService.deleteEmployee(knex, req.params.emp_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { first_name, last_name, country, dob, age } = req.body;
    const employeeToUpdate = {
      first_name,
      last_name,
      country,
      dob,
      age,
    };

    const numberOfValues =
      Object.values(employeeToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain the following: first_name, last_name, country, dob, age.`,
        },
      });
    }

    const knex = req.app.get("db");
    EmployeesService.updateEmployee(knex, req.params.emp_id, employeeToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = employeesRouter;
