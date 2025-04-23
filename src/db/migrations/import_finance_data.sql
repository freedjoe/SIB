-- Import finance data for SIB application

-- First, clear existing data (if needed)
TRUNCATE TABLE budget_allocations CASCADE;
TRUNCATE TABLE financial_operations CASCADE;
TRUNCATE TABLE budget_categories CASCADE;
TRUNCATE TABLE ministries CASCADE;

-- Insert ministries data
INSERT INTO ministries (name, code) VALUES
('Ministère des Finances', 'FIN'),
('Ministère de l''Education Nationale', 'EDU'),
('Ministère de la Santé', 'SAN'),
('Ministère de l''Enseignement Supérieur', 'MESRS'),
('Ministère de la Justice', 'JUS'),
('Ministère de l''Intérieur', 'MICLAT'),
('Ministère de l''Energie', 'ENE'),
('Ministère du Commerce', 'COM'),
('Ministère du Tourisme', 'TOU'),
('Ministère de la Jeunesse et des Sports', 'JSP'),
('Ministère de l''Industrie', 'IND'),
('Ministère de l''Hydraulique', 'HYD'),
('Ministère de la Solidarité', 'SOL'),
('Ministère des Moudjahidines', 'MOU'),
('Ministère de la Culture', 'CUL');

-- Insert budget categories
INSERT INTO budget_categories (name, code, parent_id) VALUES
('Dépenses de Personnel', 'DP', NULL),
('Salaires', 'SAL', (SELECT id FROM budget_categories WHERE code = 'DP')),
('Primes et Indemnités', 'IND', (SELECT id FROM budget_categories WHERE code = 'DP')),

('Dépenses de Fonctionnement', 'DF', NULL),
('Fournitures', 'FOU', (SELECT id FROM budget_categories WHERE code = 'DF')),
('Services', 'SER', (SELECT id FROM budget_categories WHERE code = 'DF')),
('Maintenance', 'MAI', (SELECT id FROM budget_categories WHERE code = 'DF')),

('Dépenses d''Équipement', 'DE', NULL),
('Matériel', 'MAT', (SELECT id FROM budget_categories WHERE code = 'DE')),
('Infrastructure', 'INF', (SELECT id FROM budget_categories WHERE code = 'DE')),
('Projets', 'PRO', (SELECT id FROM budget_categories WHERE code = 'DE'));

-- Insert budget allocations for 2025
-- Education Nationale
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 850000000
        WHEN c.code = 'DF' THEN 350000000
        WHEN c.code = 'DE' THEN 450000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'EDU' AND c.parent_id IS NULL;

-- Santé
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 650000000
        WHEN c.code = 'DF' THEN 400000000
        WHEN c.code = 'DE' THEN 550000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'SAN' AND c.parent_id IS NULL;

-- MESRS
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 450000000
        WHEN c.code = 'DF' THEN 250000000
        WHEN c.code = 'DE' THEN 350000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'MESRS' AND c.parent_id IS NULL;

-- Insert sample financial operations
INSERT INTO financial_operations (
    ministry_id,
    category_id,
    fiscal_year,
    amount,
    operation_type,
    operation_date,
    description,
    status
)
SELECT
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN initial_amount * 0.25
        WHEN c.code = 'DF' THEN initial_amount * 0.30
        WHEN c.code = 'DE' THEN initial_amount * 0.20
    END,
    'DEBIT',
    '2025-01-15',
    'Premier trimestre 2025',
    'COMPLETED'
FROM budget_allocations ba
JOIN ministries m ON ba.ministry_id = m.id
JOIN budget_categories c ON ba.category_id = c.id
WHERE ba.fiscal_year = 2025;

-- Update actual amounts based on operations
UPDATE budget_allocations ba
SET actual_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM financial_operations fo
    WHERE fo.ministry_id = ba.ministry_id
    AND fo.category_id = ba.category_id
    AND fo.fiscal_year = ba.fiscal_year
)
WHERE fiscal_year = 2025;

-- Import specific ministry data
-- Example for Education Nationale
INSERT INTO financial_operations (
    ministry_id,
    category_id,
    fiscal_year,
    amount,
    operation_type,
    operation_date,
    description,
    status
)
SELECT
    m.id,
    c.id,
    2025,
    15000000,
    'DEBIT',
    '2025-03-16',
    'Allocation spéciale - Programme de modernisation',
    'COMPLETED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'EDU' AND c.code = 'MAT';

-- Example for Santé
INSERT INTO financial_operations (
    ministry_id,
    category_id,
    fiscal_year,
    amount,
    operation_type,
    operation_date,
    description,
    status
)
SELECT
    m.id,
    c.id,
    2025,
    25000000,
    'DEBIT',
    '2025-03-15',
    'Équipement médical urgent',
    'COMPLETED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'SAN' AND c.code = 'MAT';

-- Add revised amounts for some allocations
UPDATE budget_allocations
SET revised_amount = initial_amount * 1.1
WHERE fiscal_year = 2025
AND ministry_id IN (
    SELECT id FROM ministries WHERE code IN ('EDU', 'SAN', 'MESRS')
); 