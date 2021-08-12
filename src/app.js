require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { NODE_ENV } = require("./config");
const errorHandler = require("./error-handler");
const employeesRouter = require("./employees/employees-router");
const customersRouter = require("./customers/customers-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use("/api/employees", employeesRouter);
app.use("/api/customers", employeesRouter);

app.use(errorHandler);

module.exports = app;
