CREATE TABLE kuvio_projects (
  project_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  customer UUID
    REFERENCES kuvio_customers(customer_id) ON DELETE CASCADE NOT NULL,
  deadline TEXT NOT NULL,
  assigned_employees TEXT [],
  complete BOOLEAN DEFAULT false,
  date_modified TIMESTAMPTZ DEFAULT NOW()
);