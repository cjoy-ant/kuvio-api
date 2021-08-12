const CustomersService = {
  getAllCustomers(knex) {
    return knex.select("*").from("kuvio_customers");
  },

  getById(knex, customer_id) {
    return knex
      .from("kuvio_customers")
      .select("*")
      .where("customer_id", customer_id)
      .first();
  },

  deleteCustomer(knex, customer_id) {
    return knex("kuvio_customers").where({ customer_id }).delete();
  },

  updateCustomer(knex, customer_id, newCustomerFields) {
    return knex("kuvio_customers")
      .where({ customer_id })
      .update(newCustomerFields);
  },

  insertCustomer(knex, newCustomer) {
    return knex
      .insert(newCustomer)
      .into("kuvio_customers")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = CustomersService;
