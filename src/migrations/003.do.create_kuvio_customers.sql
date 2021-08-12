CREATE TABLE kuvio_customers (
  customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  customer_name TEXT NOT NULL,
  customer_phone VARCHAR(20),
  customer_email TEXT NOT NULL,
  customer_date_modified TIMESTAMPTZ DEFAULT NOW()
);