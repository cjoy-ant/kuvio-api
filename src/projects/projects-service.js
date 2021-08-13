const ProjectsSerivce = {
  getAllProjects(knex) {
    return knex.select("*").from("kuvio_projects");
  },

  getById(knex, project_id) {
    return knex
      .from("kuvio_projects")
      .select("*")
      .where("project_id", project_id)
      .first();
  },

  deleteProject(knex, project_id) {
    return knex("kuvio_projects").where({ project_id }).delete();
  },

  updateProject(knex, project_id, newProjectFields) {
    return knex("kuvio_projects")
      .where({ project_id })
      .update(newProjectFields);
  },

  insertProject(knex, newProject) {
    return knex
      .insert(newProject)
      .into("kuvio_projects")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = ProjectsSerivce;
