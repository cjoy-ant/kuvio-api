CREATE TABLE kuvio_projects (
  project_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  project_customer UUID
    REFERENCES kuvio_customers(customer_id) ON DELETE CASCADE NOT NULL,
  project_deadline TEXT NOT NULL,
  project_assigned_employees TEXT []
    REFERENCES kuvio_employees(emp_id) ON DELETE CASCADE NOT NULL,
  project_complete BOOLEAN DEFAULT false,
  project_date_modified TIMESTAMPTZ DEFAULT NOW()
);