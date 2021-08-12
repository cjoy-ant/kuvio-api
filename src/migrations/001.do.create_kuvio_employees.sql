CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE kuvio_employees (
  emp_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  emp_first_name TEXT NOT NULL,
  emp_last_name TEXT NOT NULL,
  emp_country TEXT NOT NULL,
  emp_dob TEXT NOT NULL,
  emp_age TEXT NOT NULL,
  emp_projects TEXT [],
  emp_date_modified TIMESTAMPTZ DEFAULT NOW()
);