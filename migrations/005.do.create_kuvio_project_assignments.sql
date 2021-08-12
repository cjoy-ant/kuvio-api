CREATE TABLE kuvio_project_assignments (
  project UUID NOT NULL
    REFERENCES kuvio_projects(project_id),
  employee UUID NOT NULL
    REFERENCES kuvio_employees(emp_id)
);