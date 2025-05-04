-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Fiscal Years
CREATE TABLE IF NOT EXISTS fiscal_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('planning', 'active', 'closed', 'draft')) DEFAULT 'draft',
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
    website TEXT,
    phone TEXT,
    phone2 TEXT,
    fax TEXT,
    fax2 TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    parent_id UUID REFERENCES ministries(id),
    description TEXT
);

-- 3. Budget Titles (Titre: T1, T2...)
CREATE TABLE IF NOT EXISTS budget_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g. T1, T2, T6+
    name TEXT NOT NULL,
    description TEXT
);

-- 4. Portfolios (Ministerial Entities)
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ministry_id UUID REFERENCES ministries(id),
    managing_entity TEXT,
    responsible_person TEXT,
    code VARCHAR(20),
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
    description TEXT
);

-- 5. Programs
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    objectives TEXT[],
    expected_results TEXT[],
    performance_indicators JSONB,
    code VARCHAR(20),
    type VARCHAR(20) CHECK (type IN ('program', 'subprogram')),
    parent_id UUID REFERENCES programs(id),
    allocated_ae NUMERIC,
    allocated_cp NUMERIC,
    status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft'
);

-- 5b. Subprograms (New table)
CREATE TABLE IF NOT EXISTS subprograms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    purpose TEXT
);

-- 6. Actions
CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id),
    subprogram_id UUID REFERENCES subprograms(id),
    responsible_id UUID,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('Centralized', 'Decentralized', 'Unique', 'Programmed', 'Complementary')),
    objectives TEXT[],
    indicators JSONB,
    start_date DATE,
    end_date DATE,
    montant_ae_total NUMERIC,
    montant_cp_total NUMERIC,
    status TEXT CHECK (status IN ('proposed', 'validated', 'draft', 'active', 'archived')) DEFAULT 'draft',
    commentaires TEXT,
    nb_operations INTEGER,
    taux_execution_cp NUMERIC,
    taux_execution_physique NUMERIC,
    allocated_ae NUMERIC,
    allocated_cp NUMERIC
);

-- 7. Wilayas
CREATE TABLE IF NOT EXISTS wilayas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    parent_id UUID REFERENCES wilayas(id),
    description TEXT
);

-- 8. Operations
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liens relationnels
    action_id UUID REFERENCES actions(id),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    wilaya_id UUID REFERENCES wilayas(id),
    budget_title_id UUID REFERENCES budget_titles(id),

    -- Informations générales
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    province TEXT,
    municipality TEXT,
    location TEXT,
    beneficiary TEXT,
    project_owner TEXT,
    regional_budget_directorate TEXT,
    individualization_number TEXT,
    notification_year TEXT,
    inscription_date DATE,

    -- Durée du projet
    start_year INTEGER,
    end_year INTEGER,
    start_order_date TEXT,
    completion_date TEXT,
    delay NUMERIC,

    -- Données financières
    initial_ae NUMERIC,
    current_ae NUMERIC,
    allocated_ae NUMERIC,
    committed_ae NUMERIC,
    consumed_ae NUMERIC,
    allocated_cp NUMERIC,
    notified_cp NUMERIC,
    consumed_cp NUMERIC,
    cumulative_commitments NUMERIC,
    cumulative_payments NUMERIC,


    -- Suivi de l'exécution
    physical_rate NUMERIC,     -- Taux d’avancement physique (%)
    financial_rate NUMERIC,    -- Taux de consommation financière (%)
    recent_photos TEXT[],      -- Liste des URLs ou chemins d’accès
    observations TEXT,         -- Contraintes, remarques, etc.

    -- Suivi du projet
    execution_mode TEXT CHECK (execution_mode IN ('state', 'delegation', 'PPP')),
    project_status TEXT CHECK (project_status IN (
        'not_started', 'planned', 'in_progress', 'completed', 'on_hold',
        'suspended', 'delayed', 'canceled', 'completely_frozen', 'partially_frozen'
    )),/*'Project status/phase:
- completed: Project is finished (equivalent to "Achevée")
- in_progress: Work is currently ongoing (equivalent to "En cours")
- on_hold: Temporarily stopped (equivalent to "à l''arrêt")
- canceled: Project has been terminated before completion
- planned: Project is approved but work has not started yet
- suspended: Work stopped with no defined restart date
- delayed: Behind schedule but still active
- not_started: Project is registered but work has not begun';*/

    -- Suivi de validation
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft'
);

-- 8b. Operation CPs (Credit Payments) - Les prévisions de crédits de paiement (CP)
CREATE TABLE IF NOT EXISTS operation_cps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    montant_cp NUMERIC NOT NULL CHECK (montant_cp >= 0),
    used_cp NUMERIC DEFAULT 0,
    notified BOOLEAN DEFAULT FALSE,
    UNIQUE(operation_id, fiscal_year_id, month)
);


-- 9. Budget Allocations (Dotations) - Permet de suivre les dotations initiales ou révisées en AE/CP par niveau de hiérarchie budgétaire (portefeuille, programme, action ou opération).
CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type TEXT CHECK (reference_type IN ('portfolio', 'program', 'action', 'operation')),
    reference_id UUID NOT NULL,
    budget_title_id UUID REFERENCES budget_titles(id),
    ae_amount NUMERIC DEFAULT 0,
    cp_amount NUMERIC DEFAULT 0,
    state TEXT CHECK (state IN ('initial', 'revised')),
    source TEXT CHECK (source IN (
        'budget_general',            -- Budget général de l’État
        'cas_302_145',               -- Compte d’affectation spéciale 302-145
        'external_funding',          -- Financement extérieur (emprunts, dons, etc.)
        'donation',                  -- Dons spécifiques
        'interministeriel_transfer', -- Virements interportefeuilles
        'reallocation',              -- Réaffectation interne
        'revaluation'                -- Dotation suite à revalorisation
    ))
);


-- 10. Budget Modifications - New table
CREATE TABLE IF NOT EXISTS budget_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES actions(id),
    type TEXT CHECK (type IN ('new_entry', 'revaluation', 'reallocation')),
    reason TEXT,
    amount NUMERIC,
    decision TEXT
);

-- 11. Engagements
CREATE TABLE IF NOT EXISTS engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    reference TEXT,
    date DATE,
    vendor TEXT,
    amount NUMERIC,
    status TEXT CHECK (status IN ('proposed', 'validated', 'liquidated', 'draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    code VARCHAR(20),
    inscription_date DATE,
    year INTEGER,
    type VARCHAR(20),
    history TEXT,
    description TEXT
);

-- 12. Revaluations
CREATE TABLE IF NOT EXISTS revaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id),
    code VARCHAR(20),
    revaluation_amount NUMERIC,
    reason TEXT,
    description TEXT,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    revaluation_date DATE DEFAULT CURRENT_DATE
);

-- 13. Credit Payments - Représente les ordonnancements ou paiements réels effectués pour une opération donnée, généralement à la suite d’un engagement.
CREATE TABLE IF NOT EXISTS credit_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20),
    operation_id UUID REFERENCES operations(id),
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    amount NUMERIC,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    description TEXT
);

-- 14. CP Forecasts
CREATE TABLE IF NOT EXISTS cp_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    forecast_cp NUMERIC,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    description TEXT
);

-- 15. CP Mobilisations
CREATE TABLE IF NOT EXISTS cp_mobilisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    mobilised_cp NUMERIC,
    mobilisation_date DATE,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    description TEXT
);

-- 16. CP Consumptions
CREATE TABLE IF NOT EXISTS cp_consumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobilisation_id UUID REFERENCES cp_mobilisations(id),
    consumed_cp NUMERIC,
    consumption_date DATE,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    description TEXT
);

-- 17. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id),
    payment_date DATE,
    payment_mode TEXT,
    amount NUMERIC,
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'paid', 'rejected')) DEFAULT 'draft',
    operation_id UUID REFERENCES operations(id),
    beneficiary TEXT,
    description TEXT
);

-- 18. Disbursements - New table
CREATE TABLE IF NOT EXISTS disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id),
    accounting_reference TEXT,
    amount NUMERIC,
    disbursement_date DATE
);

-- 19. Payment Requests
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id),
    operation_id UUID REFERENCES operations(id),
    requested_amount NUMERIC,
    request_date DATE,
    period VARCHAR(20),
    frequency TEXT CHECK (frequency IN ('monthly', 'quarterly', 'annual')) DEFAULT 'annual',
    justification TEXT,
    status TEXT CHECK (status IN ('draft', 'pending', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    document TEXT,
    beneficiary TEXT,
    description TEXT
);

-- 20. CP Alerts
CREATE TABLE IF NOT EXISTS cp_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    threshold_exceeded BOOLEAN,
    alert_level VARCHAR(20),
    message TEXT,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    alert_date DATE DEFAULT CURRENT_DATE
);

-- 21. Performance Indicators - New table
CREATE TABLE IF NOT EXISTS performance_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id),
    action_id UUID REFERENCES actions(id),
    name TEXT,
    current_value NUMERIC,
    target_value NUMERIC,
    unit TEXT,
    year INTEGER,
    source TEXT
);

-- 22. External Fundings - New table
CREATE TABLE IF NOT EXISTS external_fundings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor TEXT,
    program_id UUID REFERENCES programs(id),
    operation_id UUID REFERENCES operations(id),
    conditional BOOLEAN DEFAULT false,
    funding_type TEXT,
    amount NUMERIC
);

-- 23. Additional Engagements (2025)
CREATE TABLE IF NOT EXISTS extra_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    requested_amount NUMERIC,
    request_date DATE,
    justification TEXT,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    engagement_date DATE DEFAULT CURRENT_DATE
);

-- 24. Tax Revenues
CREATE TABLE IF NOT EXISTS tax_revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_name TEXT,
    beneficiary TEXT,
    allocation_percent NUMERIC,
    amount NUMERIC,
    fiscal_year_id UUID REFERENCES fiscal_years(id)
);

-- 25. Special Funds
CREATE TABLE IF NOT EXISTS special_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_number VARCHAR(20),
    name TEXT,
    description TEXT,
    category TEXT,
    balance_2023 NUMERIC
);

-- 26. Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 27. Users
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

-- 28. Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    position TEXT,  -- e.g., Ordonateur, Directeur, Wali
    structure TEXT,
    wilaya_id UUID REFERENCES wilayas(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 29. Enterprises
CREATE TABLE IF NOT EXISTS enterprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nif TEXT,
    rc TEXT,
    address TEXT,
    phone TEXT,
    phone2 TEXT,
    fax TEXT,
    fax2 TEXT,
    email TEXT,
    website TEXT,
    description TEXT
);

-- 30. Report Types
CREATE TABLE IF NOT EXISTS report_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);

-- 31. Statuses
CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);

-- 32. Requests
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

-- 33. Deals
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
    entreprise_name TEXT NOT NULL,
    amount DECIMAL(18,2),
    date_signed DATE,
    physical_rate NUMERIC,
    financial_rate NUMERIC,
    delay NUMERIC,
    description TEXT
);

-- 34. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
);

-- 35. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_url TEXT
);

-- 36. Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- 37. Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    access_level TEXT CHECK (access_level IN ('public', 'private', 'restricted')) DEFAULT 'private'
);

-- 38. Settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    value_type TEXT CHECK (value_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    category TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 39. Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id),
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    conditions JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, resource, action)
);

-- 40. Tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 41. Tag Associations
CREATE TABLE IF NOT EXISTS tag_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tag_id, entity_type, entity_id)
);

-- 42. Milestones
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completion_date DATE,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')) DEFAULT 'pending',
    progress NUMERIC CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 43. Attachments
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT false
);

-- 44. Audits
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
);

-- ============================================
-- Upgrade columns: add missing columns if needed
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            -- fiscal_years
            ('fiscal_years', 'year', 'INTEGER UNIQUE NOT NULL'),
            ('fiscal_years', 'status', 'TEXT CHECK (status IN (''planning'', ''active'', ''closed'', ''draft'')) DEFAULT ''draft'''),
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

            -- budget_titles
            ('budget_titles', 'code', 'TEXT UNIQUE NOT NULL'),
            ('budget_titles', 'name', 'TEXT NOT NULL'),
            ('budget_titles', 'description', 'TEXT'),

            -- portfolios
            ('portfolios', 'ministry_id', 'UUID REFERENCES ministries(id)'),
            ('portfolios', 'name', 'TEXT NOT NULL'),
            ('portfolios', 'managing_entity', 'TEXT'),
            ('portfolios', 'responsible_person', 'TEXT'),
            ('portfolios', 'code', 'VARCHAR(20)'),
            ('portfolios', 'allocated_ae', 'NUMERIC'),
            ('portfolios', 'allocated_cp', 'NUMERIC'),
            ('portfolios', 'status', 'TEXT CHECK (status IN (''draft'', ''active'', ''archived'')) DEFAULT ''draft'''),
            ('portfolios', 'description', 'TEXT'),

            -- programs
            ('programs', 'portfolio_id', 'UUID REFERENCES portfolios(id) ON DELETE CASCADE'),
            ('programs', 'name', 'TEXT NOT NULL'),
            ('programs', 'description', 'TEXT'),
            ('programs', 'objectives', 'TEXT[]'),
            ('programs', 'expected_results', 'TEXT[]'),
            ('programs', 'performance_indicators', 'JSONB'),
            ('programs', 'code', 'VARCHAR(20)'),
            ('programs', 'type', 'VARCHAR(20) CHECK (type IN (''program'', ''subprogram''))'),
            ('programs', 'parent_id', 'UUID REFERENCES programs(id)'),
            ('programs', 'allocated_ae', 'NUMERIC'),
            ('programs', 'allocated_cp', 'NUMERIC'),
            ('programs', 'status', 'TEXT CHECK (status IN (''draft'', ''active'', ''archived'')) DEFAULT ''draft'''),

            -- subprograms
            ('subprograms', 'program_id', 'UUID REFERENCES programs(id) ON DELETE CASCADE'),
            ('subprograms', 'name', 'TEXT NOT NULL'),
            ('subprograms', 'purpose', 'TEXT'),

            -- actions
            ('actions', 'program_id', 'UUID REFERENCES programs(id)'),
            ('actions', 'subprogram_id', 'UUID REFERENCES subprograms(id)'),
            ('actions', 'responsible_id', 'UUID'),
            ('actions', 'name', 'TEXT NOT NULL'),
            ('actions', 'code', 'TEXT UNIQUE NOT NULL'),
            ('actions', 'description', 'TEXT'),
            ('actions', 'type', 'TEXT CHECK (type IN (''Centralized'', ''Decentralized'', ''Unique'', ''Programmed'', ''Complementary''))'),
            ('actions', 'objectives', 'TEXT[]'),
            ('actions', 'indicators', 'JSONB'),
            ('actions', 'start_date', 'DATE'),
            ('actions', 'end_date', 'DATE'),
            ('actions', 'montant_ae_total', 'NUMERIC'),
            ('actions', 'montant_cp_total', 'NUMERIC'),
            ('actions', 'status', 'TEXT CHECK (status IN (''proposed'', ''validated'', ''draft'', ''active'', ''archived'')) DEFAULT ''draft'''),
            ('actions', 'commentaires', 'TEXT'),
            ('actions', 'nb_operations', 'INTEGER'),
            ('actions', 'taux_execution_cp', 'NUMERIC'),
            ('actions', 'taux_execution_physique', 'NUMERIC'),
            ('actions', 'allocated_ae', 'NUMERIC'),
            ('actions', 'allocated_cp', 'NUMERIC'),

            -- wilayas
            ('wilayas', 'code', 'VARCHAR(10)'),
            ('wilayas', 'name_ar', 'TEXT'),
            ('wilayas', 'name_en', 'TEXT'),
            ('wilayas', 'name_fr', 'TEXT NOT NULL'),
            ('wilayas', 'description', 'TEXT'),
            ('wilayas', 'parent_id', 'UUID REFERENCES wilayas(id)'),
            ('wilayas', 'is_active', 'BOOLEAN'),

            -- operations
            ('operations', 'action_id', 'UUID REFERENCES actions(id)'),
            ('operations', 'program_id', 'UUID REFERENCES programs(id) ON DELETE CASCADE'),
            ('operations', 'wilaya_id', 'UUID REFERENCES wilayas(id)'),
            ('operations', 'budget_title_id', 'UUID REFERENCES budget_titles(id)'),
            
            -- Informations générales
            ('operations', 'code', 'TEXT UNIQUE NOT NULL'),
            ('operations', 'name', 'TEXT'),
            ('operations', 'description', 'TEXT'),
            ('operations', 'province', 'TEXT'),
            ('operations', 'municipality', 'TEXT'),
            ('operations', 'location', 'TEXT'),
            ('operations', 'beneficiary', 'TEXT'),
            ('operations', 'project_owner', 'TEXT'),
            ('operations', 'regional_budget_directorate', 'TEXT'),
            ('operations', 'individualization_number', 'TEXT'),
            ('operations', 'notification_year', 'TEXT'),
            ('operations', 'inscription_date', 'DATE'),
            
            -- Durée du projet
            ('operations', 'start_year', 'INTEGER'),
            ('operations', 'end_year', 'INTEGER'),
            ('operations', 'start_order_date', 'TEXT'),
            ('operations', 'completion_date', 'TEXT'),
            ('operations', 'delay', 'NUMERIC'),
            
            -- Données financières
            ('operations', 'initial_ae', 'NUMERIC'),
            ('operations', 'current_ae', 'NUMERIC'),
            ('operations', 'allocated_ae', 'NUMERIC'),
            ('operations', 'committed_ae', 'NUMERIC'),
            ('operations', 'consumed_ae', 'NUMERIC'),
            ('operations', 'allocated_cp', 'NUMERIC'),
            ('operations', 'notified_cp', 'NUMERIC'),
            ('operations', 'consumed_cp', 'NUMERIC'),
            ('operations', 'cumulative_commitments', 'NUMERIC'),
            ('operations', 'cumulative_payments', 'NUMERIC'),
            
            -- Suivi de l'exécution
            ('operations', 'physical_rate', 'NUMERIC'),
            ('operations', 'financial_rate', 'NUMERIC'),
            ('operations', 'recent_photos', 'TEXT[]'),
            ('operations', 'observations', 'TEXT'),
            
            -- Suivi du projet
            ('operations', 'execution_mode', 'TEXT CHECK (execution_mode IN (''state'', ''delegation'', ''PPP''))'),
            ('operations', 'project_status', 'TEXT CHECK (project_status IN (''not_started'', ''planned'', ''in_progress'', ''completed'', ''on_hold'', ''suspended'', ''delayed'', ''canceled'', ''completely_frozen'', ''partially_frozen''))'),
            
            -- Suivi de validation
            ('operations', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),

            -- operation_cps
            ('operation_cps', 'operation_id', 'UUID REFERENCES operations(id) ON DELETE CASCADE'),
            ('operation_cps', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('operation_cps', 'month', 'INTEGER CHECK (month BETWEEN 1 AND 12)'),
            ('operation_cps', 'montant_cp', 'NUMERIC NOT NULL CHECK (montant_cp >= 0)'),
            ('operation_cps', 'used_cp', 'NUMERIC DEFAULT 0'),
            ('operation_cps', 'notified', 'BOOLEAN DEFAULT FALSE'),

            -- allocations
            ('allocations', 'reference_type', 'TEXT CHECK (reference_type IN (''portfolio'', ''program'', ''action'', ''operation''))'),
            ('allocations', 'reference_id', 'UUID NOT NULL'),
            ('allocations', 'budget_title_id', 'UUID REFERENCES budget_titles(id)'),
            ('allocations', 'ae_amount', 'NUMERIC DEFAULT 0'),
            ('allocations', 'cp_amount', 'NUMERIC DEFAULT 0'),
            ('allocations', 'state', 'TEXT CHECK (state IN (''initial'', ''revised''))'),
            ('allocations', 'source', 'TEXT CHECK (source IN (''budget_general'', ''cas_302_145'', ''external_funding'', ''donation'', ''interministeriel_transfer'', ''reallocation'', ''revaluation''))'),

            -- budget_modifications
            ('budget_modifications', 'action_id', 'UUID REFERENCES actions(id)'),
            ('budget_modifications', 'type', 'TEXT CHECK (type IN (''new_entry'', ''revaluation'', ''reallocation''))'),
            ('budget_modifications', 'reason', 'TEXT'),
            ('budget_modifications', 'amount', 'NUMERIC'),
            ('budget_modifications', 'decision', 'TEXT'),

            -- engagements
            ('engagements', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('engagements', 'reference', 'TEXT'),
            ('engagements', 'date', 'DATE'),
            ('engagements', 'vendor', 'TEXT'),
            ('engagements', 'amount', 'NUMERIC'),
            ('engagements', 'status', 'TEXT CHECK (status IN (''proposed'', ''validated'', ''liquidated'', ''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('engagements', 'code', 'VARCHAR(20)'),
            ('engagements', 'inscription_date', 'DATE'),
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
            ('revaluations', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('revaluations', 'revaluation_date', 'DATE DEFAULT CURRENT_DATE'),

            -- credit_payments
            ('credit_payments', 'code', 'VARCHAR(20)'),
            ('credit_payments', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('credit_payments', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('credit_payments', 'amount', 'NUMERIC'),
            ('credit_payments', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('credit_payments', 'description', 'TEXT'),

            -- payments
            ('payments', 'engagement_id', 'UUID REFERENCES engagements(id)'),
            ('payments', 'payment_date', 'DATE'),
            ('payments', 'payment_mode', 'TEXT'),
            ('payments', 'amount', 'NUMERIC'),
            ('payments', 'status', 'TEXT CHECK (status IN (''draft'', ''pending'', ''approved'', ''paid'', ''rejected'')) DEFAULT ''draft'''),
            ('payments', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('payments', 'beneficiary', 'TEXT'),
            ('payments', 'description', 'TEXT'),

            -- disbursements
            ('disbursements', 'payment_id', 'UUID REFERENCES payments(id)'),
            ('disbursements', 'accounting_reference', 'TEXT'),
            ('disbursements', 'amount', 'NUMERIC'),
            ('disbursements', 'disbursement_date', 'DATE'),

            -- performance_indicators
            ('performance_indicators', 'program_id', 'UUID REFERENCES programs(id)'),
            ('performance_indicators', 'action_id', 'UUID REFERENCES actions(id)'),
            ('performance_indicators', 'name', 'TEXT'),
            ('performance_indicators', 'current_value', 'NUMERIC'),
            ('performance_indicators', 'target_value', 'NUMERIC'),
            ('performance_indicators', 'unit', 'TEXT'),
            ('performance_indicators', 'year', 'INTEGER'),
            ('performance_indicators', 'source', 'TEXT'),

            -- external_fundings
            ('external_fundings', 'donor', 'TEXT'),
            ('external_fundings', 'program_id', 'UUID REFERENCES programs(id)'),
            ('external_fundings', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('external_fundings', 'conditional', 'BOOLEAN DEFAULT false'),
            ('external_fundings', 'funding_type', 'TEXT'),
            ('external_fundings', 'amount', 'NUMERIC'),

            -- Rest of the existing columns for other tables
            ('cp_forecasts', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('cp_forecasts', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),
            ('cp_forecasts', 'forecast_cp', 'NUMERIC'),
            ('cp_forecasts', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('cp_forecasts', 'description', 'TEXT'),

            ('cp_mobilisations', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('cp_mobilisations', 'mobilised_cp', 'NUMERIC'),
            ('cp_mobilisations', 'mobilisation_date', 'DATE'),
            ('cp_mobilisations', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('cp_mobilisations', 'description', 'TEXT'),

            ('cp_consumptions', 'mobilisation_id', 'UUID REFERENCES cp_mobilisations(id)'),
            ('cp_consumptions', 'consumed_cp', 'NUMERIC'),
            ('cp_consumptions', 'consumption_date', 'DATE'),
            ('cp_consumptions', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('cp_consumptions', 'description', 'TEXT'),

            ('payment_requests', 'engagement_id', 'UUID REFERENCES engagements(id)'),
            ('payment_requests', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('payment_requests', 'requested_amount', 'NUMERIC'),
            ('payment_requests', 'request_date', 'DATE'),
            ('payment_requests', 'period', 'VARCHAR(20)'),
            ('payment_requests', 'frequency', 'TEXT CHECK (frequency IN (''monthly'', ''quarterly'', ''annual'')) DEFAULT ''annual'''),
            ('payment_requests', 'justification', 'TEXT'),
            ('payment_requests', 'status', 'TEXT CHECK (status IN (''draft'', ''pending'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('payment_requests', 'document', 'TEXT'),
            ('payment_requests', 'beneficiary', 'TEXT'),
            ('payment_requests', 'description', 'TEXT'),

            ('cp_alerts', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('cp_alerts', 'threshold_exceeded', 'BOOLEAN'),
            ('cp_alerts', 'alert_level', 'VARCHAR(20)'),
            ('cp_alerts', 'message', 'TEXT'),
            ('cp_alerts', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('cp_alerts', 'alert_date', 'DATE DEFAULT CURRENT_DATE'),

            -- Extra engagements
            ('extra_engagements', 'operation_id', 'UUID REFERENCES operations(id)'),
            ('extra_engagements', 'requested_amount', 'NUMERIC'),
            ('extra_engagements', 'request_date', 'DATE'),
            ('extra_engagements', 'justification', 'TEXT'),
            ('extra_engagements', 'status', 'TEXT CHECK (status IN (''draft'', ''submitted'', ''reviewed'', ''approved'', ''rejected'')) DEFAULT ''draft'''),
            ('extra_engagements', 'engagement_date', 'DATE DEFAULT CURRENT_DATE'),

            -- Tax revenues
            ('tax_revenues', 'tax_name', 'TEXT'),
            ('tax_revenues', 'beneficiary', 'TEXT'),
            ('tax_revenues', 'allocation_percent', 'NUMERIC'),
            ('tax_revenues', 'amount', 'NUMERIC'),
            ('tax_revenues', 'fiscal_year_id', 'UUID REFERENCES fiscal_years(id)'),

            -- Special funds
            ('special_funds', 'account_number', 'VARCHAR(20)'),
            ('special_funds', 'name', 'TEXT'),
            ('special_funds', 'description', 'TEXT'),
            ('special_funds', 'category', 'TEXT'),
            ('special_funds', 'balance_2023', 'NUMERIC'),

            -- Roles
            ('roles', 'name', 'TEXT NOT NULL UNIQUE'),
            ('roles', 'description', 'TEXT'),

            -- Users
            ('users', 'email', 'TEXT UNIQUE NOT NULL'),
            ('users', 'password', 'TEXT NOT NULL'),
            ('users', 'full_name', 'TEXT'),
            ('users', 'role_id', 'UUID REFERENCES roles(id)'),
            ('users', 'organization', 'TEXT'),
            ('users', 'phone', 'TEXT'),
            ('users', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),

            -- User profiles
            ('user_profiles', 'user_id', 'UUID REFERENCES users(id)'),
            ('user_profiles', 'position', 'TEXT'),
            ('user_profiles', 'structure', 'TEXT'),
            ('user_profiles', 'wilaya_id', 'UUID REFERENCES wilayas(id)'),
            ('user_profiles', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),

            -- Enterprises
            ('enterprises', 'name', 'TEXT NOT NULL'),
            ('enterprises', 'nif', 'TEXT'),
            ('enterprises', 'rc', 'TEXT'),
            ('enterprises', 'address', 'TEXT'),
            ('enterprises', 'phone', 'TEXT'),
            ('enterprises', 'phone2', 'TEXT'),
            ('enterprises', 'fax', 'TEXT'),
            ('enterprises', 'fax2', 'TEXT'),
            ('enterprises', 'email', 'TEXT'),
            ('enterprises', 'website', 'TEXT'),
            ('enterprises', 'description', 'TEXT'),

            -- Report types
            ('report_types', 'name', 'TEXT NOT NULL'),
            ('report_types', 'description', 'TEXT'),

            -- Statuses
            ('statuses', 'name', 'TEXT NOT NULL'),
            ('statuses', 'description', 'TEXT'),

            -- Requests
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

            -- Deals
            ('deals', 'operation_id', 'UUID REFERENCES operations(id) ON DELETE CASCADE'),
            ('deals', 'entreprise_name', 'TEXT NOT NULL'),
            ('deals', 'amount', 'DECIMAL(18,2)'),
            ('deals', 'date_signed', 'DATE'),
            ('deals', 'physical_rate', 'NUMERIC'),
            ('deals', 'financial_rate', 'NUMERIC'),
            ('deals', 'delay', 'NUMERIC'),
            ('deals', 'description', 'TEXT'),

            -- Activity logs
            ('activity_logs', 'user_id', 'UUID REFERENCES users(id)'),
            ('activity_logs', 'action_type', 'TEXT NOT NULL'),
            ('activity_logs', 'entity_type', 'TEXT NOT NULL'),
            ('activity_logs', 'entity_id', 'UUID'),
            ('activity_logs', 'details', 'JSONB'),
            ('activity_logs', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('activity_logs', 'ip_address', 'TEXT'),

            -- Notifications
            ('notifications', 'user_id', 'UUID REFERENCES users(id)'),
            ('notifications', 'title', 'TEXT NOT NULL'),
            ('notifications', 'message', 'TEXT NOT NULL'),
            ('notifications', 'entity_type', 'TEXT'),
            ('notifications', 'entity_id', 'UUID'),
            ('notifications', 'is_read', 'BOOLEAN DEFAULT false'),
            ('notifications', 'priority', 'TEXT CHECK (priority IN (''low'', ''medium'', ''high'')) DEFAULT ''medium'''),
            ('notifications', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('notifications', 'action_url', 'TEXT'),

            -- Comments
            ('comments', 'user_id', 'UUID REFERENCES users(id)'),
            ('comments', 'entity_type', 'TEXT NOT NULL'),
            ('comments', 'entity_id', 'UUID NOT NULL'),
            ('comments', 'content', 'TEXT NOT NULL'),
            ('comments', 'parent_id', 'UUID REFERENCES comments(id)'),
            ('comments', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('comments', 'updated_at', 'TIMESTAMP'),
            ('comments', 'is_deleted', 'BOOLEAN DEFAULT false'),

            -- Documents
            ('documents', 'user_id', 'UUID REFERENCES users(id)'),
            ('documents', 'entity_type', 'TEXT NOT NULL'),
            ('documents', 'entity_id', 'UUID NOT NULL'),
            ('documents', 'file_name', 'TEXT NOT NULL'),
            ('documents', 'file_path', 'TEXT NOT NULL'),
            ('documents', 'file_size', 'INTEGER'),
            ('documents', 'file_type', 'TEXT'),
            ('documents', 'title', 'TEXT'),
            ('documents', 'description', 'TEXT'),
            ('documents', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('documents', 'updated_at', 'TIMESTAMP'),
            ('documents', 'access_level', 'TEXT CHECK (access_level IN (''public'', ''private'', ''restricted'')) DEFAULT ''private'''),

            -- Settings
            ('settings', 'key', 'TEXT NOT NULL UNIQUE'),
            ('settings', 'value', 'TEXT'),
            ('settings', 'value_type', 'TEXT CHECK (value_type IN (''string'', ''number'', ''boolean'', ''json'')) DEFAULT ''string'''),
            ('settings', 'description', 'TEXT'),
            ('settings', 'category', 'TEXT'),
            ('settings', 'is_system', 'BOOLEAN DEFAULT false'),
            ('settings', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('settings', 'updated_at', 'TIMESTAMP'),

            -- Permissions
            ('permissions', 'role_id', 'UUID REFERENCES roles(id)'),
            ('permissions', 'resource', 'TEXT NOT NULL'),
            ('permissions', 'action', 'TEXT NOT NULL'),
            ('permissions', 'conditions', 'JSONB'),
            ('permissions', 'description', 'TEXT'),
            ('permissions', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),

            -- Tags
            ('tags', 'name', 'TEXT NOT NULL UNIQUE'),
            ('tags', 'color', 'TEXT'),
            ('tags', 'description', 'TEXT'),
            ('tags', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),

            -- Tag associations
            ('tag_associations', 'tag_id', 'UUID REFERENCES tags(id) ON DELETE CASCADE'),
            ('tag_associations', 'entity_type', 'TEXT NOT NULL'),
            ('tag_associations', 'entity_id', 'UUID NOT NULL'),
            ('tag_associations', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),

            -- Milestones
            ('milestones', 'operation_id', 'UUID REFERENCES operations(id) ON DELETE CASCADE'),
            ('milestones', 'title', 'TEXT NOT NULL'),
            ('milestones', 'description', 'TEXT'),
            ('milestones', 'due_date', 'DATE'),
            ('milestones', 'completion_date', 'DATE'),
            ('milestones', 'status', 'TEXT CHECK (status IN (''pending'', ''in_progress'', ''completed'', ''delayed'', ''cancelled'')) DEFAULT ''pending'''),
            ('milestones', 'progress', 'NUMERIC CHECK (progress >= 0 AND progress <= 100) DEFAULT 0'),
            ('milestones', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('milestones', 'updated_at', 'TIMESTAMP'),

            -- Attachments
            ('attachments', 'user_id', 'UUID REFERENCES users(id)'),
            ('attachments', 'entity_type', 'TEXT NOT NULL'),
            ('attachments', 'entity_id', 'UUID NOT NULL'),
            ('attachments', 'file_name', 'TEXT NOT NULL'),
            ('attachments', 'file_path', 'TEXT NOT NULL'),
            ('attachments', 'file_size', 'INTEGER'),
            ('attachments', 'file_type', 'TEXT'),
            ('attachments', 'description', 'TEXT'),
            ('attachments', 'uploaded_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('attachments', 'is_public', 'BOOLEAN DEFAULT false'),

            -- Audits
            ('audits', 'user_id', 'UUID REFERENCES users(id)'),
            ('audits', 'entity_type', 'TEXT NOT NULL'),
            ('audits', 'entity_id', 'UUID'),
            ('audits', 'action', 'TEXT NOT NULL'),
            ('audits', 'old_values', 'JSONB'),
            ('audits', 'new_values', 'JSONB'),
            ('audits', 'timestamp', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('audits', 'ip_address', 'TEXT'),
            ('audits', 'user_agent', 'TEXT')
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
