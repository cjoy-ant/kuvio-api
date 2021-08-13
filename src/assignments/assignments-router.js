const path = require("path");
const express = require("express");
const xss = require("xss");
const AssignmentsService = require("./assignments-service");

const assignmentsRouter = express.Router();
const jsonParser = express.json();

assignmentsRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    AssignmentsService.getAllAssignments(knex)
      .then((assignments) => {
        res.json(assignments);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { project, employee } = req.body;
    const newAssignment = {
      project,
      employee,
    };
    const knex = req.app.get("db");

    for (const [key, value] of Object.entries(newAssignment)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    AssignmentsService.insertAssignment(knex, newAssignment)
      .then((assignment) => {
        res.status(201).json(assignment);
      })
      .catch(next);
  });

assignmentsRouter
  .route("/:assignment_id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    AssignmentsService.getById(knex, req.params.assignment_id)
      .then((assignment) => {
        if (!assignment) {
          return res
            .status(404)
            .json({ error: { message: `Assignment not found` } });
        }
        res.assignment = assignment;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => res.json(res.assignment))
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    AssignmentsService.deleteAssignment(knex, req.params.assignment_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { project, employee } = req.body;
    const assignmentToUpdate = {
      project,
      employee,
    };

    const numberOfValues =
      Object.values(assignmentToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain the following: project, employee.`,
        },
      });
    }

    const knex = req.app.get("db");
    AssignmentsService.updateAssignment(
      knex,
      req.params.assignment_id,
      assignmentToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = assignmentsRouter;
