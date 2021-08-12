CREATE TABLE kuvio_projects (
  project_id UUID PRIMARY KEY DEFAULT uuic_generate_v1mc(),
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  project_customer TEXT NOT NULL,
  project_deadline TEXT NOT NULL,
  project_assigned_employees TEXT [],
  project_complete BOOLEAN DEFAULT false,
  project_date_modified TIMESTAMPTZ DEFAULT NOW()
);