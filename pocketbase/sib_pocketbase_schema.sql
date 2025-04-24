
-- 1. Fiscal Years
CREATE TABLE IF NOT EXISTS fiscal_years (
    id TEXT PRIMARY KEY,
    year INTEGER UNIQUE NOT NULL,
    description TEXT
);

-- 2. Ministries
CREATE TABLE IF NOT EXISTS ministries (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    parent_id TEXT,
    description TEXT
);

-- 3. Budget Categories
CREATE TABLE IF NOT EXISTS budget_categories (
    id TEXT PRIMARY KEY,
    code TEXT,
    label TEXT,
    description TEXT
);

-- 4. Portfolios
CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    ministry_id TEXT,
    name TEXT NOT NULL,
    code TEXT,
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    fiscal_year_id TEXT,
    description TEXT
);

-- 5. Program Structures
CREATE TABLE IF NOT EXISTS program_structures (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT,
    code TEXT,
    type TEXT,
    parent_id TEXT,
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    fiscal_year_id TEXT,
    description TEXT
);

-- 6. Actions
CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    program_id TEXT,
    code TEXT,
    name TEXT,
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    description TEXT
);

-- 7. Wilayas
CREATE TABLE IF NOT EXISTS wilayas (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT,
    description TEXT
);

-- 8. Operations
CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    action_id TEXT,
    wilaya_id TEXT,
    code TEXT,
    title TEXT,
    inscription_date TEXT,
    budget_category_id TEXT,
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
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    code TEXT,
    inscription_date TEXT,
    amount NUMERIC,
    year INTEGER,
    type TEXT,
    history TEXT,
    description TEXT
);

-- 10. Revaluations
CREATE TABLE IF NOT EXISTS revaluations (
    id TEXT PRIMARY KEY,
    engagement_id TEXT,
    code TEXT,
    revaluation_amount NUMERIC,
    reason TEXT,
    description TEXT,
    revaluation_date TEXT
);

-- 11. Credit Payments
CREATE TABLE IF NOT EXISTS credit_payments (
    id TEXT PRIMARY KEY,
    code TEXT,
    operation_id TEXT,
    fiscal_year_id TEXT,
    amount NUMERIC,
    description TEXT
);

-- 12. CP Forecasts
CREATE TABLE IF NOT EXISTS cp_forecasts (
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    fiscal_year_id TEXT,
    forecast_cp NUMERIC,
    description TEXT
);

-- 13. CP Mobilisations
CREATE TABLE IF NOT EXISTS cp_mobilisations (
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    mobilised_cp NUMERIC,
    mobilisation_date TEXT,
    description TEXT
);

-- 14. CP Consumptions
CREATE TABLE IF NOT EXISTS cp_consumptions (
    id TEXT PRIMARY KEY,
    mobilisation_id TEXT,
    consumed_cp NUMERIC,
    consumption_date TEXT,
    description TEXT
);

-- 15. Payments
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    amount NUMERIC,
    payment_date TEXT,
    description TEXT
);

-- 16. Payment Requests
CREATE TABLE IF NOT EXISTS payment_requests (
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    requested_amount NUMERIC,
    period TEXT,
    status TEXT,
    justification TEXT,
    document TEXT
);

-- 17. CP Alerts
CREATE TABLE IF NOT EXISTS cp_alerts (
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    threshold_exceeded INTEGER,
    alert_level TEXT,
    message TEXT,
    alert_date TEXT
);

-- 18. Extra Engagements
CREATE TABLE IF NOT EXISTS extra_engagements (
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    requested_amount NUMERIC,
    justification TEXT,
    engagement_date TEXT
);

-- 19. Tax Revenues
CREATE TABLE IF NOT EXISTS tax_revenues (
    id TEXT PRIMARY KEY,
    tax_name TEXT,
    beneficiary TEXT,
    allocation_percent NUMERIC,
    amount NUMERIC,
    fiscal_year_id TEXT
);

-- 20. Special Funds
CREATE TABLE IF NOT EXISTS special_funds (
    id TEXT PRIMARY KEY,
    account_number TEXT,
    name TEXT,
    description TEXT,
    category TEXT,
    balance_2023 NUMERIC
);


-- 21. Roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 22. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    role_id TEXT,
    organization TEXT,
    phone TEXT,
    created_at TEXT
);

-- 23. Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    position TEXT,
    structure TEXT,
    wilaya_id TEXT,
    created_at TEXT
);

-- 24. Enterprises
CREATE TABLE IF NOT EXISTS enterprises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nif TEXT,
    rc TEXT,
    address TEXT,
    phone TEXT,
    email TEXT
);

-- 25. Report Types
CREATE TABLE IF NOT EXISTS report_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- 26. Statuses
CREATE TABLE IF NOT EXISTS statuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);
