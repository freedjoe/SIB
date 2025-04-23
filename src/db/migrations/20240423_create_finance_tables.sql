-- Create finance tables for SIB application

-- Table for ministries/departments
CREATE TABLE IF NOT EXISTS ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    code VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for budget categories
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    code VARCHAR,
    parent_id UUID REFERENCES budget_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for financial operations
CREATE TABLE IF NOT EXISTS financial_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id),
    category_id UUID REFERENCES budget_categories(id),
    fiscal_year INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    operation_type VARCHAR NOT NULL, -- 'CREDIT' or 'DEBIT'
    operation_date DATE NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for budget allocations
CREATE TABLE IF NOT EXISTS budget_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id),
    category_id UUID REFERENCES budget_categories(id),
    fiscal_year INTEGER NOT NULL,
    initial_amount DECIMAL(15,2) NOT NULL,
    revised_amount DECIMAL(15,2),
    actual_amount DECIMAL(15,2),
    status VARCHAR DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_financial_operations_ministry ON financial_operations(ministry_id);
CREATE INDEX idx_financial_operations_category ON financial_operations(category_id);
CREATE INDEX idx_financial_operations_year ON financial_operations(fiscal_year);
CREATE INDEX idx_budget_allocations_ministry ON budget_allocations(ministry_id);
CREATE INDEX idx_budget_allocations_category ON budget_allocations(category_id);
CREATE INDEX idx_budget_allocations_year ON budget_allocations(fiscal_year);

-- Add audit triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ministries_updated_at
    BEFORE UPDATE ON ministries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at
    BEFORE UPDATE ON budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_operations_updated_at
    BEFORE UPDATE ON financial_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_allocations_updated_at
    BEFORE UPDATE ON budget_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 