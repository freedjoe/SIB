-- Add program_id column to actions table
ALTER TABLE actions ADD COLUMN program_id UUID REFERENCES programs(id);

-- Add requested_by column to engagements table
ALTER TABLE engagements ADD COLUMN requested_by UUID REFERENCES users(id);

-- Add program_id column to forecasted_expenses table
ALTER TABLE forecasted_expenses ADD COLUMN program_id UUID REFERENCES programs(id);

-- Update existing records with default values
UPDATE actions SET program_id = (SELECT id FROM programs LIMIT 1) WHERE program_id IS NULL;
UPDATE engagements SET requested_by = (SELECT id FROM users LIMIT 1) WHERE requested_by IS NULL;
UPDATE forecasted_expenses SET program_id = (SELECT id FROM programs LIMIT 1) WHERE program_id IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE actions ALTER COLUMN program_id SET NOT NULL;
ALTER TABLE engagements ALTER COLUMN requested_by SET NOT NULL;
ALTER TABLE forecasted_expenses ALTER COLUMN program_id SET NOT NULL; 