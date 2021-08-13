const path = require("path");
const express = require("express");
const xss = require("xss");
const ProjectsService = require("./projects-service");

const projectsRouter = express.Router();
const jsonParser = express.json();

const serializeProject = (i) => ({
  project_id: i.project_id,
  title: xss(i.title),
  project_description: xss(i.project_desecription),
  customer: i.customer,
  deadline: i.deadline,
  complete: i.complete,
  date_modified: i.date_modified,
});

projectsRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    ProjectsService.getAllProjects(knex)
      .then((projects) => {
        res.json(projects.map(serializeProject));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, project_description, customer, deadline } = req.body;
    const newProject = {
      title,
      project_description,
      customer,
      deadline,
    };
    const knex = req.app.get("db");

    for (const [key, value] of Object.entries(newProject)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    ProjectsService.insertProject(knex, newProject)
      .then((project) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${project.project_id}`))
          .json(serializeProject(project));
      })
      .catch(next);
  });

projectsRouter
  .route("/:project_id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    ProjectsService.getById(knex, req.params.project_id)
      .then((project) => {
        if (!project) {
          return res
            .status(404)
            .json({ error: { message: `Project not found` } });
        }
        res.project = project;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => res.json(serializeProject(res.project)))
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    ProjectsService.deleteProject(knex, req.params.project_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, project_description, customer, deadline } = req.body;
    const projectToUpdate = {
      title,
      project_description,
      customer,
      deadline,
    };

    const numberOfValues =
      Object.values(projectToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain the following: title, project_description, customer, deadline.`,
        },
      });
    }

    const knex = req.app.get("db");
    ProjectsService.updateProject(knex, req.params.project_id, projectToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = projectsRouter;
