-- Import sample CP data

-- Insert operations
INSERT INTO operations (name, ministry_id, description)
SELECT 
    CONCAT('Opération ', m.code, ' - ', ROW_NUMBER() OVER (PARTITION BY m.id ORDER BY m.id)),
    m.id,
    CONCAT('Description de l''opération pour ', m.name)
FROM ministries m
WHERE m.code IN ('EDU', 'SAN', 'MESRS', 'FIN', 'JUS');

-- Insert engagements
INSERT INTO engagements (operation_id, amount, engagement_date, exercice, status, description)
SELECT 
    o.id,
    CASE 
        WHEN m.code = 'EDU' THEN 250000000
        WHEN m.code = 'SAN' THEN 180000000
        WHEN m.code = 'MESRS' THEN 150000000
        WHEN m.code = 'FIN' THEN 120000000
        WHEN m.code = 'JUS' THEN 100000000
    END,
    '2025-01-15'::date,
    2025,
    'APPROVED',
    CONCAT('Engagement initial 2025 - ', o.name)
FROM operations o
JOIN ministries m ON o.ministry_id = m.id;

-- Insert Q1 previsions
INSERT INTO prevision_cp (
    engagement_id,
    operation_id,
    exercice,
    amount,
    payment_date,
    status,
    description
)
SELECT 
    e.id,
    e.operation_id,
    2025,
    e.amount * 0.25,  -- 25% of engagement amount
    '2025-03-31'::date,
    'PENDING',
    CONCAT('Prévision CP Q1 2025 - ', o.name)
FROM engagements e
JOIN operations o ON e.operation_id = o.id
WHERE e.exercice = 2025;

-- Insert Q2 previsions
INSERT INTO prevision_cp (
    engagement_id,
    operation_id,
    exercice,
    amount,
    payment_date,
    status,
    description
)
SELECT 
    e.id,
    e.operation_id,
    2025,
    e.amount * 0.25,  -- 25% of engagement amount
    '2025-06-30'::date,
    'PENDING',
    CONCAT('Prévision CP Q2 2025 - ', o.name)
FROM engagements e
JOIN operations o ON e.operation_id = o.id
WHERE e.exercice = 2025; 