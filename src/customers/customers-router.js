const path = require("path");
const express = require("express");
const xss = require("xss");
const CustomersService = require("./customers-service");

const customersRouter = express.Router();
const jsonParser = express.json();

const serializeCustomer = (i) => ({
  customer_id: i.customer_id,
  customer_name: xss(i.customer_name),
  phone: xss(i.customer_phone),
  email: xss(i.customer_email),
  date_modified: i.date_modified,
});

customersRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    CustomersService.getAllCustomers(knex)
      .then((customers) => {
        res.json(customers.map(serializeCustomer));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { customer_name, phone, email } = req.body;
    const newCustomer = {
      customer_name,
      phone,
      email,
    };
    const knex = req.app.get("db");

    for (const [key, value] of Object.entries(newCustomer)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    CustomersService.insertCustomer(knex, newCustomer)
      .then((customer) => {
        res
          .status(201)
          .location(
            path.posix.join(req.originalUrl, `/${customer.customer_id}`)
          )
          .json(serializeCustomer(customer));
      })
      .catch(next);
  });

customersRouter
  .route("/:customer_id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    CustomersService.getById(knex, req.params.customer_id)
      .then((customer) => {
        if (!customer) {
          return res
            .status(404)
            .json({ error: { message: `Customer not found` } });
        }
        res.customer = customer;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => res.json(serializeCustomer(res.customer)))
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    CustomersService.deleteCustomer(knex, req.params.customer_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { customer_name, phone, email } = req.body;
    const customerToUpdate = {
      customer_name,
      phone,
      email,
    };

    const numberOfValues =
      Object.values(customerToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain the following: customer_name, phone, email.`,
        },
      });
    }

    const knex = req.app.get("db");
    CustomersService.updateCustomer(
      knex,
      req.params.customer_id,
      customerToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = customersRouter;
