CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE kuvio_employees (
  emp_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  country VARCHAR(3)
    REFERENCES kuvio_countries(code3) ON DELETE CASCADE NOT NULL,
  dob TEXT NOT NULL,
  age TEXT NOT NULL,
  date_modified TIMESTAMPTZ DEFAULT NOW()
);