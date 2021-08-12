const EmployeesService = {
  getAllEmployees(knex) {
    return knex.select("*").from("kuvio_employees");
  },

  getById(knex, emp_id) {
    return knex
      .from("kuvio_employees")
      .select("*")
      .where("emp_id", emp_id)
      .first();
  },

  deleteEmployee(knex, emp_id) {
    return knex("kuvio_employees").where({ emp_id }).delete();
  },

  updateEmployee(knex, emp_id, newEmployeeFields) {
    return knex("kuvio_employees").where({ emp_id }).update(newEmployeeFields);
  },

  insertEmployee(knex, newEmployee) {
    return knex
      .insert(newEmployee)
      .into("kuvio_employees")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = EmployeesService;
