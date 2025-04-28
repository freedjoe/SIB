-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code_programme TEXT,
    description TEXT,
    budget DECIMAL(18,2),
    allocated DECIMAL(18,2),
    fiscal_year INTEGER,
    portfolio_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
CREATE POLICY "Users can view all programs"
    ON programs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert programs"
    ON programs FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update programs"
    ON programs FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Users can delete programs"
    ON programs FOR DELETE
    TO authenticated
    USING (true);