-- Create portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create programs table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    name TEXT NOT NULL,
    description TEXT,
    code_programme TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create actions table
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id),
    name TEXT NOT NULL,
    description TEXT,
    code_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create operations table
CREATE TABLE operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id),
    action_id UUID NOT NULL REFERENCES actions(id),
    name TEXT NOT NULL,
    description TEXT,
    code_operation TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    titre_budgetaire INTEGER NOT NULL CHECK (titre_budgetaire BETWEEN 1 AND 5),
    origine_financement TEXT NOT NULL CHECK (origine_financement IN ('budget_national', 'financement_exterieur')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create engagements table
CREATE TABLE engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    reference TEXT NOT NULL,
    description TEXT,
    statut_demande TEXT NOT NULL CHECK (statut_demande IN ('en_attente', 'validee', 'rejetee')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
); 