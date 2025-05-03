

-- Create the budget_titles table
CREATE TABLE budget_titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,        -- e.g., T1, T2, ..., T6+
  name TEXT NOT NULL,
  description TEXT
);

-- Insert standard budget titles
INSERT INTO budget_titles (code, name, description) VALUES
('T1', 'Personnel Expenditures', 'Salaries, wages, social contributions, bonuses for civil servants.'),
('T2', 'Material & Operating', 'Office supplies, maintenance, utilities, IT, etc.'),
('T3', 'Intervention Expenditures', 'Transfers to households, subsidies, grants, pensions, etc.'),
('T4', 'Investment Expenditures', 'Capital expenditures: infrastructure, equipment, new assets, R&D.'),
('T5', 'Public Debt Service', 'Loan repayments and interest payments (debt servicing).'),
('T6+', 'Special Accounts / Others', 'For example, treasury advances, special funds, etc. (varies by country).');
