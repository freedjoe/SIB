-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagements(id),
    operation_id UUID NOT NULL REFERENCES operations(id),
    amount DECIMAL(15,2) NOT NULL,
    request_date DATE NOT NULL,
    payment_date DATE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    beneficiary TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create payment_requests table
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagements(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    operation_id UUID NOT NULL REFERENCES operations(id),
    amount DECIMAL(15,2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
    start_date DATE NOT NULL,
    request_date DATE NOT NULL,
    approved_date DATE,
    status TEXT NOT NULL CHECK (status IN ('pending_officer', 'pending_accountant', 'approved', 'rejected')),
    requested_by TEXT NOT NULL,
    beneficiary TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create ministers table
CREATE TABLE ministers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    minister_id UUID NOT NULL REFERENCES ministers(id),
    year INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create budget_lines table
CREATE TABLE budget_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
); 