const knex = require("knex");
const app = require("../src/app");

const {
  countries,
  makeEmployeesArray,
  makeMaliciousEmployee,
  testIds,
} = require("./fixtures");

describe("/employees endpoint", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw(
      "TRUNCATE kuvio_countries, kuvio_employees, kuvio_customers, kuvio_projects, kuvio_project_assignments RESTART IDENTITY CASCADE"
    )
  );

  afterEach("cleanup", () =>
    db.raw(
      "TRUNCATE kuvio_countries, kuvio_employees, kuvio_customers, kuvio_projects, kuvio_project_assignments RESTART IDENTITY CASCADE"
    )
  );

  describe("GET /api/employees", () => {
    context("Given no employees", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get(`/api/employees`).expect(200, []);
      });
    });

    context("Given there are employees in the database", () => {
      const testEmployees = makeEmployeesArray();

      beforeEach("insert test employees", () => {
        return db
          .into("kuvio_countries")
          .insert(countries)
          .then(() => {
            return db.into("kuvio_employees").insert(testEmployees);
          });
      });

      it("GET /api/employees responds with 200 and all of the employees", () => {
        return supertest(app).get(`/api/employees`).expect(200, testEmployees);
      });
    });

    context("Given XSS attack content", () => {
      const testEmployees = makeEmployeesArray();
      const { maliciousEmployee, expectedEmployee } = makeMaliciousEmployee();

      beforeEach("insert malicious employee", () => {
        return db
          .into("kuvio_countries")
          .insert(countries)
          .then(() => {
            return db
              .into("kuvio_employees")
              .insert(testEmployees)
              .then(() => {
                return db.into("kuvio_employees").insert([maliciousEmployee]);
              });
          });
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/employees`)
          .expect(200)
          .expect((res) => {
            expect(res.body[res.body.length - 1].emp_id).to.eql(
              expectedEmployee.emp_id
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].first_name).to.eql(
              expectedEmployee.first_name
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].last_name).to.eql(
              expectedEmployee.last_name
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].country).to.eql(
              expectedEmployee.country
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].dob.slice(0, 10)).to.eql(
              expectedEmployee.dob.slice(0, 10)
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].age).to.eql(
              expectedEmployee.age
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].date_modified).to.eql(
              expectedEmployee.date_modified
            );
          });
      });
    });
  });

  describe("POST /api/employees", () => {
    const testEmployees = makeEmployeesArray();

    beforeEach("insert test employees", () => {
      return db
        .into("kuvio_countries")
        .insert(countries)
        .then(() => {
          return db.into("kuvio_employees").insert(testEmployees);
        });
    });

    it("creates a provider, responding with 201 and the new employee", () => {
      const newEmployee = {
        first_name: "New",
        last_name: "Employee",
        country: "USA",
        dob: "1991-06-01T07:00:00.000Z",
        age: "30",
      };

      return supertest(app)
        .post(`/api/employees`)
        .send(newEmployee)
        .expect(201)
        .expect((res) => {
          expect(res.body.first_name).to.eql(newEmployee.first_name);
          expect(res.body.last_name).to.eql(newEmployee.last_name);
          expect(res.body.country).to.eql(newEmployee.country);
          expect(res.body.dob).to.eql(newEmployee.dob);
          expect(res.body.age).to.eql(newEmployee.age);
          expect(res.body).to.have.property("emp_id");
          expect(res.headers.location).to.eql(
            `/api/employees/${res.body.emp_id}`
          );
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/employees/${postRes.body.emp_id}`)
            .expect(postRes.body)
        );
    });

    // validation testing
    const requiredFields = ["first_name", "last_name", "country", "dob"];

    requiredFields.forEach((field) => {
      const newEmployee = {
        first_name: "New",
        last_name: "Employee",
        country: "USA",
        dob: "1991-06-01T07:00:00.000Z",
        age: "30",
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newEmployee[field];

        return supertest(app)
          .post(`/api/employees`)
          .send(newEmployee)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    it("removes XSS attack content", () => {
      const { maliciousEmployee, expectedEmployee } = makeMaliciousEmployee();
      return supertest(app)
        .post(`/api/employees`)
        .send(maliciousEmployee)
        .expect(201)
        .expect((res) => {
          expect(res.body.first_name).to.eql(expectedEmployee.first_name);
        })
        .expect((res) => {
          expect(res.body.last_name).to.eql(expectedEmployee.last_name);
        })
        .expect((res) => {
          expect(res.body.country).to.eql(expectedEmployee.country);
        })
        .expect((res) => {
          expect(res.body.dob).to.eql(expectedEmployee.dob);
        })
        .expect((res) => {
          expect(res.body.age).to.eql(expectedEmployee.age);
        });
    });
  });

  describe("DELETE /api/employees/:emp_id", () => {
    context("Given no employees", () => {
      it("responds with 404", () => {
        const employeeId = testIds.employee;
        return supertest(app)
          .delete(`/api/employees/${employeeId}`)
          .expect(404, { error: { message: `employee not found` } });
      });
    });

    context("Given there are employees in the database", () => {
      const testEmployees = makeEmployeesArray();

      beforeEach("insert test employees", () => {
        return db
          .into("kuvio_countries")
          .insert(countries)
          .then(() => {
            return db.into("kuvio_employees").insert(testEmployees);
          });
      });

      it("responds with 204 and removes the employee", () => {
        const idToRemove = testIds.employee; // test employee 1
        const expectedemployees = testEmployees.filter(
          (employee) => employee.employee_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/employees/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/employees`).expect(expectedemployees);
          });
      });
    });
  });

  describe("DELETE /api/employees/:emp_id", () => {
    context("Given no employees", () => {
      it("responds with 404", () => {
        const employeeId = testIds.employee;
        return supertest(app)
          .delete(`/api/employees/${employeeId}`)
          .expect(404, { error: { message: `Employee not found` } });
      });
    });

    context("Given there are employees in the database", () => {
      const testEmployees = makeEmployeesArray();

      beforeEach("insert test employees", () => {
        return db
          .into("kuvio_countries")
          .insert(countries)
          .then(() => {
            return db.into("kuvio_employees").insert(testEmployees);
          });
      });

      it("responds with 204 and removes the employee", () => {
        const idToRemove = testIds.employee; // test employee 1
        const expectedemployees = testEmployees.filter(
          (employee) => employee.employee_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/employees/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/employees`).expect(expectedemployees);
          });
      });
    });
  });

  describe("PATCH /api/employees/:emp_id", () => {
    context("Given no employees", () => {
      it("responds with 404", () => {
        const employeeId = testIds.employee;
        return supertest(app)
          .patch(`/api/employees/${employeeId}`)
          .expect(404, { error: { message: `Employee not found` } });
      });
    });

    context("Given there are employees in the database", () => {
      const testEmployees = makeEmployeesArray();

      beforeEach("insert test employees", () => {
        return db
          .into("kuvio_countries")
          .insert(countries)
          .then(() => {
            return db.into("kuvio_employees").insert(testEmployees);
          });
      });

      it("responds with 204 and updates the employee", () => {
        const idToUpdate = testIds.employee; // test employee 1
        const updatedEmployee = {
          emp_id: "076a6bc0-fa0c-11eb-9a03-0242ac130003",
          first_name: "Updated",
          last_name: "Employee",
          country: "USA",
          dob: "1991-06-01T00:00:00.000Z",
          age: "30",
        };

        const expectedEmployee = {
          ...testEmployees[0],
          ...updatedEmployee,
        };

        return supertest(app)
          .patch(`/api/employees/${idToUpdate}`)
          .send(updatedEmployee)
          .expect(204)
          .then((res) => {
            supertest(app)
              .get(`/api/employees/${idToUpdate}`)
              .expect(expectedEmployee);
          });
      });
    });
  });
});
