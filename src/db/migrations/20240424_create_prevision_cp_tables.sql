-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS prevision_cp CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;
DROP TABLE IF EXISTS operations CASCADE;

-- Create operations table
CREATE TABLE operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create engagements table
CREATE TABLE engagements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    engagement_date DATE NOT NULL,
    exercice INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prevision_cp table
CREATE TABLE prevision_cp (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
    exercice INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE,
    status TEXT DEFAULT 'PENDING',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_operations_ministry ON operations(ministry_id);
CREATE INDEX idx_engagements_operation ON engagements(operation_id);
CREATE INDEX idx_engagements_exercice ON engagements(exercice);
CREATE INDEX idx_prevision_cp_engagement ON prevision_cp(engagement_id);
CREATE INDEX idx_prevision_cp_operation ON prevision_cp(operation_id);
CREATE INDEX idx_prevision_cp_exercice ON prevision_cp(exercice);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_operations_updated_at ON operations;
DROP TRIGGER IF EXISTS update_engagements_updated_at ON engagements;
DROP TRIGGER IF EXISTS update_prevision_cp_updated_at ON prevision_cp;

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_operations_updated_at
    BEFORE UPDATE ON operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagements_updated_at
    BEFORE UPDATE ON engagements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prevision_cp_updated_at
    BEFORE UPDATE ON prevision_cp
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE prevision_cp ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON operations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON engagements
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON prevision_cp
    FOR ALL USING (auth.role() = 'authenticated'); 