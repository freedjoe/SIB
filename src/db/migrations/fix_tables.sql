-- Create ministries table
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add generated_date column to reports table
ALTER TABLE reports ADD COLUMN generated_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add beneficiary column to engagements table
ALTER TABLE engagements ADD COLUMN beneficiary TEXT NOT NULL DEFAULT '';

-- Fix foreign key relationships
ALTER TABLE operations ADD COLUMN action_id UUID REFERENCES actions(id);
ALTER TABLE cp_forecasts ADD COLUMN program_id UUID REFERENCES programs(id);

-- Insert test data into ministries
INSERT INTO ministries (id, name, code, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Ministère de l''Éducation', 'MIN-EDU', 'Ministère en charge de l''éducation nationale'),
    ('22222222-2222-2222-2222-222222222222', 'Ministère de la Santé', 'MIN-SAN', 'Ministère en charge de la santé publique'),
    ('33333333-3333-3333-3333-333333333333', 'Ministère des Infrastructures', 'MIN-INF', 'Ministère en charge des travaux publics'),
    ('44444444-4444-4444-4444-444444444444', 'Ministère de l''Agriculture', 'MIN-AGR', 'Ministère en charge du développement rural');

-- Update existing reports with generated_date
UPDATE reports SET generated_date = report_date WHERE generated_date IS NULL;

-- Update existing engagements with beneficiary
UPDATE engagements SET beneficiary = 'Default Beneficiary' WHERE beneficiary = ''; 