
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
    code VARCHAR(10),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT NOT NULL,
    address TEXT,
    email TEXT,
    phone TEXT,
    phone2 TEXT,
    fax TEXT,
    fax2 TEXT,
    is_active BOOLEAN,
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
    delay NUMERIC,
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

-- 27. Requests
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    title TEXT,
    ref TEXT,
    date_submitted DATE DEFAULT CURRENT_DATE,
    cp_amount DECIMAL(18,2) NOT NULL,
    ae_amount DECIMAL(18,2) NOT NULL,
    type TEXT CHECK (type IN ('New registration', 'Revaluation', 'Payment credit', 'Allocation', 'Reallocation', 'Transfer', 'Additional request', 'Previous commitments', 'Balance to regularize', 'Other')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    comments TEXT,
    description TEXT
);

-- 28. Deals
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    amount DECIMAL(18,2),
    date_signed DATE,
    physical_rate NUMERIC,
    financial_rate NUMERIC,
    delay NUMERIC,
    description TEXT
);

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables if not exist (first part of your script)
-- You can keep your original CREATE TABLE IF NOT EXISTS blocks
-- THEN add the upgrade logic below

-- Upgrade columns: add missing columns if needed
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            -- fiscal_years
            ('fiscal_years', 'year', 'INTEGER UNIQUE NOT NULL'),
            ('fiscal_years', 'description', 'TEXT'),

            -- ministries
            ('ministries', 'code', 'VARCHAR(10)'),
            ('ministries', 'name_ar', 'TEXT'),
            ('ministries', 'name_en', 'TEXT'),
            ('ministries', 'name_fr', 'TEXT NOT NULL'),
            ('ministries', 'address', 'TEXT'),
            ('ministries', 'email', 'TEXT'),
            ('ministries', 'phone', 'TEXT'),
            ('ministries', 'phone2', 'TEXT'),
            ('ministries', 'fax', 'TEXT'),
            ('ministries', 'fax2', 'TEXT'),
            ('ministries', 'is_active', 'BOOLEAN'),
            ('ministries', 'parent_id', 'UUID REFERENCES ministries(id)'),
            ('ministries', 'description', 'TEXT'),

            -- budget_categories
            ('budget_categories', 'code', 'VARCHAR(10)'),
            ('budget_categories', 'label', 'TEXT'),
            ('budget_categories', 'description', 'TEXT'),

            -- portfolios
            ('portfolios', 'ministry_id', 'UUID REFERENCES ministries(id)'),
            ('portfolios', 'name', 'TEXT NOT NULL'),
            ('portfolios', 'code', 'VARCHAR(20)'),
            ('portfolios', 'allocated_ae', 'NUMERIC'),
            ('portfolios', 'allocated_cp', 'NUMERIC'),
            ('portfolios', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('portfolios', 'description', 'TEXT'),

            -- program_structures
            ('program_structures', 'portfolio_id', 'UUID REFERENCES portfolios(id)'),
            ('program_structures', 'code', 'VARCHAR(20)'),
            ('program_structures', 'type', 'VARCHAR(20) CHECK (type IN (''program'', ''subprogram'', ''dotation''))'),
            ('program_structures', 'parent_id', 'UUID REFERENCES program_structures(id)'),
            ('program_structures', 'allocated_ae', 'NUMERIC'),
            ('program_structures', 'allocated_cp', 'NUMERIC'),
            ('program_structures', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('program_structures', 'description', 'TEXT'),

            -- actions
            ('actions', 'program_id', 'UUID REFERENCES program_structures(id)'),
            ('actions', 'code', 'VARCHAR(20)'),
            ('actions', 'name', 'TEXT'),
            ('actions', 'type', 'VARCHAR(20) CHECK (type IN (''Centralized'', ''Decentralized'', ''Unique'', ''Programmed'', ''Complementary''))'),
            ('actions', 'allocated_ae', 'NUMERIC'),
            ('actions', 'allocated_cp', 'NUMERIC'),
            ('actions', 'description', 'TEXT'),

            -- wilayas
            ('wilayas', 'code', 'VARCHAR(10)'),
            ('wilayas', 'name', 'TEXT'),
            ('wilayas', 'description', 'TEXT'),

            -- operations
            ('operations', 'action_id', 'UUID REFERENCES actions(id)'),
            ('operations', 'wilaya_id', 'UUID REFERENCES wilayas(id)'),
            ('operations', 'code', 'VARCHAR(20)'),
            ('operations', 'title', 'TEXT'),
            ('operations', 'inscription_date', 'DATE'),
            ('operations', 'budget_category_id', 'UUID REFERENCES budget_categories(id)'),
            ('operations', 'allocated_ae', 'NUMERIC'),
            ('operations', 'allocated_cp', 'NUMERIC'),
            ('operations', 'consumed_ae', 'NUMERIC'),
            ('operations', 'consumed_cp', 'NUMERIC'),
            ('operations', 'physical_rate', 'NUMERIC'),
            ('operations', 'financial_rate', 'NUMERIC'),
            ('operations', 'delay', 'NUMERIC'),
            ('operations', 'description', 'TEXT'),

            -- engagements
            ('engagements', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('engagements', 'code', 'VARCHAR(20)'),
            ('engagements', 'inscription_date', 'DATE'),
            ('engagements', 'amount', 'NUMERIC'),
            ('engagements', 'year', 'INTEGER'),
            ('engagements', 'type', 'VARCHAR(20)'),
            ('engagements', 'history', 'TEXT'),
            ('engagements', 'description', 'TEXT'),

            -- revaluations
            ('revaluations', 'engagement_id', 'UUID REFERENCES engagements(id)'),
            ('revaluations', 'code', 'VARCHAR(20)'),
            ('revaluations', 'revaluation_amount', 'NUMERIC'),
            ('revaluations', 'reason', 'TEXT'),
            ('revaluations', 'description', 'TEXT'),
            ('revaluations', 'revaluation_date', 'DATE DEFAULT CURRENT_DATE'),

            -- credit_payments
            ('credit_payments', 'code', 'VARCHAR(20)'),
            ('credit_payments', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('credit_payments', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('credit_payments', 'amount', 'NUMERIC'),
            ('credit_payments', 'description', 'TEXT'),

            -- cp_forecasts
            ('cp_forecasts', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('cp_forecasts', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('cp_forecasts', 'forecast_cp', 'NUMERIC'),
            ('cp_forecasts', 'description', 'TEXT'),

            -- cp_mobilisations
            ('cp_mobilisations', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('cp_mobilisations', 'mobilised_cp', 'NUMERIC'),
            ('cp_mobilisations', 'mobilisation_date', 'DATE'),
            ('cp_mobilisations', 'description', 'TEXT'),

            -- cp_consumptions
            ('cp_consumptions', 'mobilisation_id', 'UUID REFERENCES cp_mobilisations(id)'),
            ('cp_consumptions', 'consumed_cp', 'NUMERIC'),
            ('cp_consumptions', 'consumption_date', 'DATE'),
            ('cp_consumptions', 'description', 'TEXT'),

            -- payments
            ('payments', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('payments', 'amount', 'NUMERIC'),
            ('payments', 'payment_date', 'DATE'),
            ('payments', 'description', 'TEXT'),

            -- payment_requests
            ('payment_requests', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('payment_requests', 'requested_amount', 'NUMERIC'),
            ('payment_requests', 'period', 'VARCHAR(20)'),
            ('payment_requests', 'status', 'VARCHAR(20)'),
            ('payment_requests', 'justification', 'TEXT'),
            ('payment_requests', 'document', 'TEXT'),

            -- cp_alerts
            ('cp_alerts', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('cp_alerts', 'threshold_exceeded', 'BOOLEAN'),
            ('cp_alerts', 'alert_level', 'VARCHAR(20)'),
            ('cp_alerts', 'message', 'TEXT'),
            ('cp_alerts', 'alert_date', 'DATE DEFAULT CURRENT_DATE'),

            -- extra_engagements
            ('extra_engagements', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('extra_engagements', 'requested_amount', 'NUMERIC'),
            ('extra_engagements', 'justification', 'TEXT'),
            ('extra_engagements', 'engagement_date', 'DATE DEFAULT CURRENT_DATE'),

            -- tax_revenues
            ('tax_revenues', 'tax_name', 'TEXT'),
            ('tax_revenues', 'beneficiary', 'TEXT'),
            ('tax_revenues', 'allocation_percent', 'NUMERIC'),
            ('tax_revenues', 'amount', 'NUMERIC'),
            ('tax_revenues', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),

            -- special_funds
            ('special_funds', 'account_number', 'VARCHAR(20)'),
            ('special_funds', 'name', 'TEXT'),
            ('special_funds', 'description', 'TEXT'),
            ('special_funds', 'category', 'TEXT'),
            ('special_funds', 'balance_2023', 'NUMERIC'),

            -- roles
            ('roles', 'name', 'TEXT NOT NULL UNIQUE'),
            ('roles', 'description', 'TEXT'),

            -- users
            ('users', 'email', 'TEXT UNIQUE NOT NULL'),
            ('users', 'password', 'TEXT NOT NULL'),
            ('users', 'full_name', 'TEXT'),
            ('users', 'role_id', 'UUID REFERENCES roles(id)'),
            ('users', 'organization', 'TEXT'),
            ('users', 'phone', 'TEXT'),
            ('users', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),

            -- user_profiles
            ('user_profiles', 'user_id', 'UUID REFERENCES users(id)'),
            ('user_profiles', 'position', 'TEXT'),
            ('user_profiles', 'structure', 'TEXT'),
            ('user_profiles', 'wilaya_id', 'UUID REFERENCES wilayas(id)'),
            ('user_profiles', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),

            -- enterprises
            ('enterprises', 'name', 'TEXT NOT NULL'),
            ('enterprises', 'nif', 'TEXT'),
            ('enterprises', 'rc', 'TEXT'),
            ('enterprises', 'address', 'TEXT'),
            ('enterprises', 'phone', 'TEXT'),
            ('enterprises', 'email', 'TEXT'),

            -- report_types
            ('report_types', 'name', 'TEXT NOT NULL'),
            ('report_types', 'description', 'TEXT'),

            -- statuses
            ('statuses', 'name', 'TEXT NOT NULL'),
            ('statuses', 'description', 'TEXT'),

            -- requests
            ('requests', 'ministry_id', 'UUID REFERENCES ministries(id) ON DELETE CASCADE'),
            ('requests', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('requests', 'title', 'TEXT'),
            ('requests', 'ref', 'TEXT'),
            ('requests', 'date_submitted', 'DATE DEFAULT CURRENT_DATE'),
            ('requests', 'cp_amount', 'DECIMAL(18,2) NOT NULL'),
            ('requests', 'ae_amount', 'DECIMAL(18,2) NOT NULL'),
            ('requests', 'type', 'TEXT CHECK (type IN (''New registration'', ''Revaluation'', ''Payment credit'', ''Allocation'', ''Reallocation'', ''Transfer'', ''Additional request'', ''Previous commitments'', ''Balance to regularize'', ''Other''))'),
            ('requests', 'priority', 'TEXT CHECK (priority IN (''low'', ''medium'', ''high'')) DEFAULT ''medium'''),
            ('requests', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('requests', 'comments', 'TEXT'),
            ('requests', 'description', 'TEXT'),

            -- deals
            ('deals', 'operation_id', 'UUID REFERENCES operations(id) ON DELETE CASCADE'),
            ('deals', 'company_name', 'TEXT NOT NULL'),
            ('deals', 'amount', 'DECIMAL(18,2)'),
            ('deals', 'date_signed', 'DATE'),
            ('deals', 'physical_rate', 'NUMERIC'),
            ('deals', 'financial_rate', 'NUMERIC'),
            ('deals', 'delay', 'NUMERIC'),
            ('deals', 'description', 'TEXT')

        ) AS columns(table_name, column_name, column_type)
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = r.table_name
            AND column_name = r.column_name
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', r.table_name, r.column_name, r.column_type);
        END IF;
    END LOOP;
END $$;
