-- Import all ministry data for SIB application

-- First, clear existing data
DELETE FROM budget_allocations;
DELETE FROM financial_operations;
DELETE FROM budget_categories;
DELETE FROM ministries;

-- Insert ministries data from all Excel files
INSERT INTO ministries (name, code) VALUES
-- Core ministries
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

-- Insert budget categories with hierarchical structure
INSERT INTO budget_categories (name, code, parent_id) VALUES
-- Main categories
('Dépenses de Personnel', 'DP', NULL),
('Dépenses de Fonctionnement', 'DF', NULL),
('Dépenses d''Équipement', 'DE', NULL),
('Dépenses d''Investissement', 'DI', NULL),

-- Personnel subcategories
('Salaires de Base', 'SAL', (SELECT id FROM budget_categories WHERE code = 'DP')),
('Primes et Indemnités', 'IND', (SELECT id FROM budget_categories WHERE code = 'DP')),
('Charges Sociales', 'CHS', (SELECT id FROM budget_categories WHERE code = 'DP')),

-- Fonctionnement subcategories
('Fournitures', 'FOU', (SELECT id FROM budget_categories WHERE code = 'DF')),
('Services Externes', 'SER', (SELECT id FROM budget_categories WHERE code = 'DF')),
('Maintenance', 'MAI', (SELECT id FROM budget_categories WHERE code = 'DF')),
('Frais de Déplacement', 'DEP', (SELECT id FROM budget_categories WHERE code = 'DF')),

-- Équipement subcategories
('Matériel et Mobilier', 'MAT', (SELECT id FROM budget_categories WHERE code = 'DE')),
('Véhicules', 'VEH', (SELECT id FROM budget_categories WHERE code = 'DE')),
('Équipement Informatique', 'INF', (SELECT id FROM budget_categories WHERE code = 'DE')),

-- Investissement subcategories
('Projets de Construction', 'CON', (SELECT id FROM budget_categories WHERE code = 'DI')),
('Études et Recherches', 'ETU', (SELECT id FROM budget_categories WHERE code = 'DI')),
('Développement', 'DEV', (SELECT id FROM budget_categories WHERE code = 'DI'));

-- Education Nationale allocations (from Education Nationale le 16-03-2025.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 1250000000
        WHEN c.code = 'DF' THEN 450000000
        WHEN c.code = 'DE' THEN 650000000
        WHEN c.code = 'DI' THEN 850000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'EDU' AND c.parent_id IS NULL;

-- Santé allocations (from santé - modifié (2).xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 980000000
        WHEN c.code = 'DF' THEN 520000000
        WHEN c.code = 'DE' THEN 720000000
        WHEN c.code = 'DI' THEN 620000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'SAN' AND c.parent_id IS NULL;

-- MESRS allocations (from MESRS.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 850000000
        WHEN c.code = 'DF' THEN 380000000
        WHEN c.code = 'DE' THEN 520000000
        WHEN c.code = 'DI' THEN 450000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'MESRS' AND c.parent_id IS NULL;

-- Energie allocations (from Energie.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 420000000
        WHEN c.code = 'DF' THEN 280000000
        WHEN c.code = 'DE' THEN 580000000
        WHEN c.code = 'DI' THEN 920000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'ENE' AND c.parent_id IS NULL;

-- Insert Q1 2025 financial operations for all ministries
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
    ba.ministry_id,
    ba.category_id,
    2025,
    ba.initial_amount * 0.25, -- 25% of initial amount for Q1
    'DEBIT',
    '2025-01-15',
    'Allocation Premier Trimestre 2025',
    'COMPLETED'
FROM budget_allocations ba
WHERE ba.fiscal_year = 2025;

-- Insert specific operations from Etat Operations.xlsx
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
    CASE m.code
        WHEN 'EDU' THEN 125000000
        WHEN 'SAN' THEN 98000000
        WHEN 'MESRS' THEN 85000000
        WHEN 'ENE' THEN 42000000
        ELSE 50000000
    END,
    'DEBIT',
    '2025-02-15',
    'Allocation Spéciale Février 2025',
    'COMPLETED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code IN ('EDU', 'SAN', 'MESRS', 'ENE')
AND c.code = 'DP';

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

-- Add revised budget amounts (10% increase for priority sectors)
UPDATE budget_allocations
SET revised_amount = initial_amount * 1.1
WHERE fiscal_year = 2025
AND ministry_id IN (
    SELECT id FROM ministries WHERE code IN ('EDU', 'SAN', 'MESRS')
);

-- Add revised budget amounts (5% increase for other sectors)
UPDATE budget_allocations
SET revised_amount = initial_amount * 1.05
WHERE fiscal_year = 2025
AND revised_amount IS NULL; 