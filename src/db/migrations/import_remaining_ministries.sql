-- Import remaining ministry data

-- Justice et Finances (from Suivi des demandes non retenues Justice et Finances.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN m.code = 'JUS' THEN
            CASE 
                WHEN c.code = 'DP' THEN 580000000
                WHEN c.code = 'DF' THEN 320000000
                WHEN c.code = 'DE' THEN 420000000
                WHEN c.code = 'DI' THEN 380000000
            END
        WHEN m.code = 'FIN' THEN
            CASE 
                WHEN c.code = 'DP' THEN 620000000
                WHEN c.code = 'DF' THEN 380000000
                WHEN c.code = 'DE' THEN 480000000
                WHEN c.code = 'DI' THEN 520000000
            END
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code IN ('JUS', 'FIN') AND c.parent_id IS NULL;

-- MICLAT (from MICLAT 2025-3.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 720000000
        WHEN c.code = 'DF' THEN 420000000
        WHEN c.code = 'DE' THEN 580000000
        WHEN c.code = 'DI' THEN 680000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'MICLAT' AND c.parent_id IS NULL;

-- Commerce (from Commerce suivi commande rattachement CP 2025.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 380000000
        WHEN c.code = 'DF' THEN 220000000
        WHEN c.code = 'DE' THEN 280000000
        WHEN c.code = 'DI' THEN 320000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'COM' AND c.parent_id IS NULL;

-- Tourisme (from Tourisme.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 280000000
        WHEN c.code = 'DF' THEN 180000000
        WHEN c.code = 'DE' THEN 320000000
        WHEN c.code = 'DI' THEN 420000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'TOU' AND c.parent_id IS NULL;

-- Jeunesse et Sports (from jeunesse et sport-2.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 420000000
        WHEN c.code = 'DF' THEN 280000000
        WHEN c.code = 'DE' THEN 380000000
        WHEN c.code = 'DI' THEN 420000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'JSP' AND c.parent_id IS NULL;

-- Industrie (from Besoins en crédits MIndustrie -3.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 380000000
        WHEN c.code = 'DF' THEN 220000000
        WHEN c.code = 'DE' THEN 480000000
        WHEN c.code = 'DI' THEN 580000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'IND' AND c.parent_id IS NULL;

-- Hydraulique (from Canevas DBPDSE-3 hydraulique.xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN c.code = 'DP' THEN 420000000
        WHEN c.code = 'DF' THEN 280000000
        WHEN c.code = 'DE' THEN 580000000
        WHEN c.code = 'DI' THEN 780000000
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code = 'HYD' AND c.parent_id IS NULL;

-- Solidarité, Moudjahidines, Culture (from (Solidarité, moudjahidines, culture et culte).xlsx)
INSERT INTO budget_allocations (ministry_id, category_id, fiscal_year, initial_amount, status)
SELECT 
    m.id,
    c.id,
    2025,
    CASE 
        WHEN m.code = 'SOL' THEN
            CASE 
                WHEN c.code = 'DP' THEN 320000000
                WHEN c.code = 'DF' THEN 180000000
                WHEN c.code = 'DE' THEN 280000000
                WHEN c.code = 'DI' THEN 380000000
            END
        WHEN m.code = 'MOU' THEN
            CASE 
                WHEN c.code = 'DP' THEN 280000000
                WHEN c.code = 'DF' THEN 160000000
                WHEN c.code = 'DE' THEN 220000000
                WHEN c.code = 'DI' THEN 280000000
            END
        WHEN m.code = 'CUL' THEN
            CASE 
                WHEN c.code = 'DP' THEN 260000000
                WHEN c.code = 'DF' THEN 180000000
                WHEN c.code = 'DE' THEN 280000000
                WHEN c.code = 'DI' THEN 320000000
            END
    END,
    'APPROVED'
FROM ministries m
CROSS JOIN budget_categories c
WHERE m.code IN ('SOL', 'MOU', 'CUL') AND c.parent_id IS NULL;

-- Insert Q1 2025 financial operations for remaining ministries
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
    ba.initial_amount * 0.25,
    'DEBIT',
    '2025-01-15',
    'Allocation Premier Trimestre 2025',
    'COMPLETED'
FROM budget_allocations ba
JOIN ministries m ON ba.ministry_id = m.id
WHERE ba.fiscal_year = 2025
AND m.code IN ('JUS', 'FIN', 'MICLAT', 'COM', 'TOU', 'JSP', 'IND', 'HYD', 'SOL', 'MOU', 'CUL');

-- Update actual amounts for remaining ministries
WITH operation_totals AS (
    SELECT 
        ministry_id,
        category_id,
        fiscal_year,
        SUM(amount) as total_amount
    FROM financial_operations
    GROUP BY ministry_id, category_id, fiscal_year
)
UPDATE budget_allocations
SET actual_amount = ot.total_amount
FROM operation_totals ot
WHERE budget_allocations.ministry_id = ot.ministry_id
AND budget_allocations.category_id = ot.category_id
AND budget_allocations.fiscal_year = ot.fiscal_year; 