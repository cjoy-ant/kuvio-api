const AssignmentsService = {
  getAllAssignments(knex) {
    return knex.select("*").from("kuvio_project_assignments");
  },

  getById(knex, assignment_id) {
    return knex
      .from("kuvio_project_assignments")
      .select("*")
      .where({ assignment_id })
      .first();
  },

  getByProjectId(knex, project) {
    return knex
      .from("kuvio_project_assignments")
      .select("*")
      .where({ project })
      .first();
  },

  getByEmployeeId(knex, employee) {
    return knex
      .from("kuvio_project_assignments")
      .select("*")
      .where({ employee })
      .first();
  },

  deleteAssignment(knex, project, employee) {
    return knex("kuvio_project_assignments")
      .where({ project })
      .andWhere({ employee })
      .delete();
  },

  updateAssignment(knex, project, employee, newAssignmentFields) {
    return knex("kuvio_project_assignments")
      .where({ project })
      .andWhere({ employee })
      .update(newAssignmentFields);
  },

  insertAssignment(knex, newAssignment) {
    return knex
      .insert(newAssignment)
      .into("kuvio_project_assignments")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = AssignmentsService;
