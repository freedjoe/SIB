
-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Fiscal Years
CREATE TABLE IF NOT EXISTS fiscal_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER UNIQUE NOT NULL,
    description TEXT
);

-- 2. Ministries
CREATE TABLE IF NOT EXISTS ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES ministries(id),
    description TEXT
);

-- 3. Budget Categories
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10),
    label TEXT,
    description TEXT
);

-- 4. Portfolios
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_id UUID REFERENCES ministries(id),
    name TEXT NOT NULL,
    code VARCHAR(20),
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    description TEXT
);

-- 5. Program Structures
CREATE TABLE IF NOT EXISTS program_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id),
    code VARCHAR(20),
    type VARCHAR(20) CHECK (type IN ('program', 'subprogram', 'dotation')),
    parent_id UUID REFERENCES program_structures(id),
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    description TEXT
);

-- 6. Actions
CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES program_structures(id),
    code VARCHAR(20),
    name TEXT,
    type VARCHAR(20) CHECK (type IN ('Centralized', 'Decentralized', 'Unique', 'Programmed', 'Complementary')),
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    description TEXT
);

-- 7. Wilayas
CREATE TABLE IF NOT EXISTS wilayas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10),
    name TEXT,
    description TEXT
);

-- 8. Operations
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES actions(id),
    wilaya_id UUID REFERENCES wilayas(id),
    code VARCHAR(20),
    title TEXT,
    inscription_date DATE,
    budget_category_id UUID REFERENCES budget_categories(id),
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    consumed_ae NUMERIC,
    consumed_cp NUMERIC,
    physical_rate NUMERIC,
    financial_rate NUMERIC,
    delay TEXT,
    description TEXT
);

-- 9. Engagements
CREATE TABLE IF NOT EXISTS engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    code VARCHAR(20),
    inscription_date DATE,
    amount NUMERIC,
    year INTEGER,
    type VARCHAR(20),
    history TEXT,
    description TEXT
);

-- 10. Revaluations
CREATE TABLE IF NOT EXISTS revaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id),
    code VARCHAR(20),
    revaluation_amount NUMERIC,
    reason TEXT,
    description TEXT,
    revaluation_date DATE DEFAULT CURRENT_DATE
);

-- 11. Credit Payments
CREATE TABLE IF NOT EXISTS credit_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20),
    operation_id UUID REFERENCES operations(id),
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    amount NUMERIC,
    description TEXT
);

-- 12. CP Forecasts
CREATE TABLE IF NOT EXISTS cp_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    forecast_cp NUMERIC,
    description TEXT
);

-- 13. CP Mobilisations
CREATE TABLE IF NOT EXISTS cp_mobilisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    mobilised_cp NUMERIC,
    mobilisation_date DATE,
    description TEXT
);

-- 14. CP Consumptions
CREATE TABLE IF NOT EXISTS cp_consumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobilisation_id UUID REFERENCES cp_mobilisations(id),
    consumed_cp NUMERIC,
    consumption_date DATE,
    description TEXT
);

-- 15. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    amount NUMERIC,
    payment_date DATE,
    description TEXT
);

-- 16. Payment Requests
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    requested_amount NUMERIC,
    period VARCHAR(20),
    status VARCHAR(20),
    justification TEXT,
    document TEXT
);

-- 17. CP Alerts
CREATE TABLE IF NOT EXISTS cp_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    threshold_exceeded BOOLEAN,
    alert_level VARCHAR(20),
    message TEXT,
    alert_date DATE DEFAULT CURRENT_DATE
);

-- 18. Additional Engagements (2025)
CREATE TABLE IF NOT EXISTS extra_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    requested_amount NUMERIC,
    justification TEXT,
    engagement_date DATE DEFAULT CURRENT_DATE
);

-- 19. Tax Revenues
CREATE TABLE IF NOT EXISTS tax_revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_name TEXT,
    beneficiary TEXT,
    allocation_percent NUMERIC,
    amount NUMERIC,
    fiscal_year_id UUID REFERENCES fiscal_years(id)
);

-- 20. Special Funds
CREATE TABLE IF NOT EXISTS special_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_number VARCHAR(20),
    name TEXT,
    description TEXT,
    category TEXT,
    balance_2023 NUMERIC
);


-- 21. Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 22. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    role_id UUID REFERENCES roles(id),
    organization TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    position TEXT,  -- e.g., Ordonateur, Directeur, Wali
    structure TEXT,
    wilaya_id UUID REFERENCES wilayas(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. Enterprises
CREATE TABLE IF NOT EXISTS enterprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nif TEXT,
    rc TEXT,
    address TEXT,
    phone TEXT,
    email TEXT
);

-- 25. Report Types
CREATE TABLE IF NOT EXISTS report_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);

-- 26. Statuses
CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);
