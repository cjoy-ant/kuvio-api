CREATE TABLE kuvio_customers (
  customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  customer_name TEXT NOT NULL,
  phone VARCHAR(20),
  email TEXT NOT NULL,
  date_modified TIMESTAMPTZ DEFAULT NOW()
);