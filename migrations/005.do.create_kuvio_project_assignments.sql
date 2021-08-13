CREATE TABLE kuvio_project_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  project UUID NOT NULL
    REFERENCES kuvio_projects(project_id),
  employee UUID NOT NULL
    REFERENCES kuvio_employees(emp_id)
);