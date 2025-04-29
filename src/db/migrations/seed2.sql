-- Seed script for SIGB database
-- This script contains sample data for testing and development

-- Clear existing data (if needed)
BEGIN;
    -- Disable triggers temporarily
    ALTER TABLE cp_previsions DISABLE TRIGGER ALL;
    ALTER TABLE cp_mobilisations DISABLE TRIGGER ALL;
    ALTER TABLE cp_consommations DISABLE TRIGGER ALL;
    ALTER TABLE cp_alertes DISABLE TRIGGER ALL;
    ALTER TABLE cp_historique DISABLE TRIGGER ALL;
    ALTER TABLE engagements DISABLE TRIGGER ALL;
    ALTER TABLE operations DISABLE TRIGGER ALL;
    ALTER TABLE financial_operations DISABLE TRIGGER ALL;
    ALTER TABLE budget_allocations DISABLE TRIGGER ALL;
    
    -- Delete existing data
    DELETE FROM cp_historique;
    DELETE FROM cp_alertes;
    DELETE FROM cp_consommations;
    DELETE FROM cp_mobilisations;
    DELETE FROM cp_previsions;
    DELETE FROM engagement_revaluations;
    DELETE FROM engagements;
    DELETE FROM operations;
    DELETE FROM financial_operations;
    DELETE FROM budget_allocations;
    DELETE FROM budget_categories;
    DELETE FROM ministries;
    
    -- Re-enable triggers
    ALTER TABLE cp_previsions ENABLE TRIGGER ALL;
    ALTER TABLE cp_mobilisations ENABLE TRIGGER ALL;
    ALTER TABLE cp_consommations ENABLE TRIGGER ALL;
    ALTER TABLE cp_alertes ENABLE TRIGGER ALL;
    ALTER TABLE cp_historique ENABLE TRIGGER ALL;
    ALTER TABLE engagements ENABLE TRIGGER ALL;
    ALTER TABLE operations ENABLE TRIGGER ALL;
    ALTER TABLE financial_operations ENABLE TRIGGER ALL;
    ALTER TABLE budget_allocations ENABLE TRIGGER ALL;
COMMIT;

-- Insert ministries with their codes and names
INSERT INTO ministries (id, name, code, created_at) VALUES
    (uuid_generate_v4(), 'Présidence de la République', 'PR', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Services du Premier ministre', 'PM', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Défense nationale', 'MDN', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Affaires étrangères, communauté nationale à l''étranger et affaires africaines', 'MAE', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Energie, mines et énergies renouvelables', 'MEM', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Intérieur, collectivités locales et aménagement du territoire', 'MICLAT', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Education nationale', 'MEN', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Enseignement supérieur et recherche scientifique', 'MESRS', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Formation et enseignement professionnels', 'MFEP', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Jeunesse et sports', 'MJS', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Culture et arts', 'MCA', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Solidarité nationale, famille et condition de la femme', 'MSNFCF', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Industrie et production pharmaceutique', 'MIPP', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Agriculture et développement rural', 'MADR', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Habitat, urbanisme et ville', 'MHUV', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Commerce et promotion des exportations', 'MCPE', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Communication', 'MC', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Travaux publics et infrastructures de base', 'MTPIB', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Transports', 'MT', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Ressources en eau et sécurité hydrique', 'MRESH', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Tourisme et artisanat', 'MTA', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Santé', 'MS', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Travail, emploi et sécurité sociale', 'MTESS', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Relations avec le Parlement', 'MRP', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Environnement et énergies renouvelables', 'MEER', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Pêche et productions halieutiques', 'MPPH', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Numérique et statistiques', 'MNS', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Moudjahidine et ayants-droit', 'MMA', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Affaires religieuses et wakfs', 'MARW', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Finances', 'MF', CURRENT_TIMESTAMP);

-- Insert budget categories
INSERT INTO budget_categories (id, name, code, parent_id, created_at) VALUES
    ('aaaaaaaa-0000-4000-a000-000000000000', 'Dépenses de Personnel', 'T1', NULL, CURRENT_TIMESTAMP),
    ('bbbbbbbb-1111-4111-b111-111111111111', 'Dépenses de Fonctionnement', 'T2', NULL, CURRENT_TIMESTAMP),
    ('cccccccc-2222-4222-c222-222222222222', 'Dépenses d''Investissement', 'T3', NULL, CURRENT_TIMESTAMP),
    ('dddddddd-3333-4333-d333-333333333333', 'Transferts Courants', 'T4', NULL, CURRENT_TIMESTAMP);

-- Insert portfolios
INSERT INTO portfolios (id, name, description, created_at) VALUES
    ('11111111-0000-4000-a000-000000000001', 'Présidence de la République', 'Portefeuille de la Présidence', CURRENT_TIMESTAMP),
    ('22222222-1111-4111-b111-111111111112', 'Services du Premier ministre', 'Portefeuille des Services du Premier ministre', CURRENT_TIMESTAMP),
    ('33333333-2222-4222-c222-222222222223', 'Défense nationale', 'Portefeuille de la Défense nationale', CURRENT_TIMESTAMP),
    ('44444444-3333-4333-d333-333333333334', 'Affaires étrangères', 'Portefeuille des Affaires étrangères', CURRENT_TIMESTAMP),
    ('55555555-4444-4444-e444-444444444445', 'Energie et Mines', 'Portefeuille de l''Energie et des Mines', CURRENT_TIMESTAMP),
    ('66666666-5555-4555-f555-555555555556', 'Intérieur et Collectivités locales', 'Portefeuille de l''Intérieur', CURRENT_TIMESTAMP),
    ('77777777-6666-4666-a666-666666666667', 'Education nationale', 'Portefeuille de l''Education nationale', CURRENT_TIMESTAMP),
    ('88888888-7777-4777-b777-777777777778', 'Finances', 'Portefeuille des Finances', CURRENT_TIMESTAMP),
    ('99999999-8888-4888-c888-888888888889', 'Habitat et Urbanisme', 'Portefeuille de l''Habitat', CURRENT_TIMESTAMP),
    ('00000000-9999-4999-d999-99999999999a', 'Santé', 'Portefeuille de la Santé', CURRENT_TIMESTAMP);

-- Insert programs (based on actual finance law data)
INSERT INTO programs (id, portfolio_id, name, description, code, created_at) VALUES
    -- Présidence
    ('11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa', '11111111-0000-4000-a000-000000000001', 'Activité de la Présidence', 'Programme des activités présidentielles', 'PRG-001', CURRENT_TIMESTAMP),
    ('22222222-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '11111111-0000-4000-a000-000000000001', 'Coordination juridique', 'Programme de coordination juridique', 'PRG-002', CURRENT_TIMESTAMP),
    
    -- Premier ministre
    ('33333333-cccc-4ccc-cccc-cccccccccccc', '22222222-1111-4111-b111-111111111112', 'Activité du Premier ministre', 'Programme des activités du Premier ministre', 'PRG-003', CURRENT_TIMESTAMP),
    ('44444444-dddd-4ddd-dddd-dddddddddddd', '22222222-1111-4111-b111-111111111112', 'Fonction publique', 'Programme de la fonction publique', 'PRG-004', CURRENT_TIMESTAMP),
    
    -- Défense
    ('55555555-eeee-4eee-eeee-eeeeeeeeeeee', '33333333-2222-4222-c222-222222222223', 'Défense nationale', 'Programme principal de défense', 'PRG-005', CURRENT_TIMESTAMP),
    ('66666666-ffff-4fff-ffff-ffffffffffff', '33333333-2222-4222-c222-222222222223', 'Logistique militaire', 'Programme de soutien logistique', 'PRG-006', CURRENT_TIMESTAMP),
    
    -- Energie
    ('77777777-aaaa-5aaa-aaaa-aaaaaaaaaaaa', '55555555-4444-4444-e444-444444444445', 'Electricité et gaz', 'Programme énergie et distribution', 'PRG-007', CURRENT_TIMESTAMP),
    ('88888888-bbbb-5bbb-bbbb-bbbbbbbbbbbb', '55555555-4444-4444-e444-444444444445', 'Energies renouvelables', 'Programme énergies nouvelles', 'PRG-008', CURRENT_TIMESTAMP);

-- Insert actions (based on actual finance law data)
INSERT INTO actions (id, program_id, name, description, code_action, created_at) VALUES
    -- Actions Présidence
    ('ac111111-1111-1111-1111-111111111111', '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'Supervision présidentielle', 'Supervision des activités présidentielles', 'ACT-001', CURRENT_TIMESTAMP),
    ('ac222222-2222-2222-2222-222222222222', '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'Sécurité présidentielle', 'Protection et sécurité présidentielle', 'ACT-002', CURRENT_TIMESTAMP),
    
    -- Actions Premier ministre
    ('ac333333-3333-3333-3333-333333333333', '33333333-cccc-4ccc-cccc-cccccccccccc', 'Coordination gouvernementale', 'Coordination des activités gouvernementales', 'ACT-003', CURRENT_TIMESTAMP),
    ('ac444444-4444-4444-4444-444444444444', '33333333-cccc-4ccc-cccc-cccccccccccc', 'Réforme administrative', 'Actions de réforme administrative', 'ACT-004', CURRENT_TIMESTAMP),
    
    -- Actions Défense
    ('ac555555-5555-5555-5555-555555555555', '55555555-eeee-4eee-eeee-eeeeeeeeeeee', 'Opérations militaires', 'Conduite des opérations militaires', 'ACT-005', CURRENT_TIMESTAMP),
    ('ac666666-6666-6666-6666-666666666666', '55555555-eeee-4eee-eeee-eeeeeeeeeeee', 'Formation militaire', 'Formation des personnels militaires', 'ACT-006', CURRENT_TIMESTAMP),
    
    -- Actions Energie
    ('ac777777-7777-7777-7777-777777777777', '77777777-aaaa-5aaa-aaaa-aaaaaaaaaaaa', 'Distribution électricité', 'Distribution du réseau électrique', 'ACT-007', CURRENT_TIMESTAMP),
    ('ac888888-8888-8888-8888-888888888888', '77777777-aaaa-5aaa-aaaa-aaaaaaaaaaaa', 'Distribution gaz', 'Distribution du réseau de gaz', 'ACT-008', CURRENT_TIMESTAMP);

-- Insert operations (based on actual finance law data)
INSERT INTO operations (id, name, ministry_id, description, code_operation, wilaya, titre_budgetaire, origine_financement, created_at) VALUES
    -- Opérations Présidence
    ('op111111-1111-1111-1111-111111111111', 'Modernisation services présidentiels', (SELECT id FROM ministries WHERE code = 'PR'), 'Modernisation des services de la présidence', 'OP-001', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP),
    ('op222222-2222-2222-2222-222222222222', 'Rénovation palais présidentiel', (SELECT id FROM ministries WHERE code = 'PR'), 'Travaux de rénovation du palais', 'OP-002', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP),
    
    -- Opérations Premier ministre
    ('op333333-3333-3333-3333-333333333333', 'Digitalisation services', (SELECT id FROM ministries WHERE code = 'PM'), 'Digitalisation des services gouvernementaux', 'OP-003', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP),
    ('op444444-4444-4444-4444-444444444444', 'Modernisation fonction publique', (SELECT id FROM ministries WHERE code = 'PM'), 'Modernisation de la fonction publique', 'OP-004', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP),
    
    -- Opérations Défense
    ('op555555-5555-5555-5555-555555555555', 'Acquisition équipements', (SELECT id FROM ministries WHERE code = 'MDN'), 'Acquisition de nouveaux équipements militaires', 'OP-005', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP),
    ('op666666-6666-6666-6666-666666666666', 'Construction bases militaires', (SELECT id FROM ministries WHERE code = 'MDN'), 'Construction de nouvelles bases', 'OP-006', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP),
    
    -- Opérations Energie
    ('op777777-7777-7777-7777-777777777777', 'Extension réseau électrique', (SELECT id FROM ministries WHERE code = 'MEM'), 'Extension du réseau électrique national', 'OP-007', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP),
    ('op888888-8888-8888-8888-888888888888', 'Projet énergie solaire', (SELECT id FROM ministries WHERE code = 'MEM'), 'Installation de panneaux solaires', 'OP-008', 'Alger', 2, 'budget_national', CURRENT_TIMESTAMP);

-- Insert engagements (based on actual finance law data)
INSERT INTO engagements (id, operation_id, amount, engagement_date, exercice, status, description, created_at) VALUES
    ('eng11111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', 6700150000, '2024-01-15', 2024, 'APPROVED', 'Modernisation services présidentiels', CURRENT_TIMESTAMP),
    ('eng22222-2222-2222-2222-222222222222', 'op222222-2222-2222-2222-222222222222', 1089700000, '2024-02-01', 2024, 'PENDING', 'Rénovation palais présidentiel', CURRENT_TIMESTAMP),
    ('eng33333-3333-3333-3333-333333333333', 'op333333-3333-3333-3333-333333333333', 11813005000, '2024-01-20', 2024, 'APPROVED', 'Digitalisation services', CURRENT_TIMESTAMP),
    ('eng44444-4444-4444-4444-444444444444', 'op444444-4444-4444-4444-444444444444', 2198513000, '2024-03-01', 2024, 'PENDING', 'Modernisation fonction publique', CURRENT_TIMESTAMP);

-- Insert engagement revaluations (based on actual finance law data)
INSERT INTO engagement_revaluations (id, engagement_id, initial_amount, proposed_amount, reason, status, requested_by, created_at) VALUES
    ('rev11111-1111-1111-1111-111111111111', 'eng11111-1111-1111-1111-111111111111', 6700150000, 7000000000, 'Augmentation coûts matériaux', 'pending', (SELECT id FROM users LIMIT 1), CURRENT_TIMESTAMP),
    ('rev22222-2222-2222-2222-222222222222', 'eng33333-3333-3333-3333-333333333333', 11813005000, 12000000000, 'Extension périmètre travaux', 'approved', (SELECT id FROM users LIMIT 1), CURRENT_TIMESTAMP);

-- Insert CP prévisions (based on actual finance law data)
INSERT INTO cp_previsions (
    id, programme_id, exercice, periode, montant_prevu, montant_demande, 
    montant_mobilise, montant_consomme, statut, date_soumission, notes, 
    created_by, updated_by
) VALUES
    ('cp111111-1111-1111-1111-111111111111', '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 2024, '2024-Q1', 6700150000, 6700150000, 6700150000, 5000000000, 'mobilisé', '2024-01-15', 'CP Q1 2024 Présidence', (SELECT id FROM users LIMIT 1), (SELECT id FROM users LIMIT 1)),
    ('cp222222-2222-2222-2222-222222222222', '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 2024, '2024-Q2', 1089700000, 1089700000, 0, 0, 'demandé', '2024-03-20', 'CP Q2 2024 Présidence', (SELECT id FROM users LIMIT 1), (SELECT id FROM users LIMIT 1));

-- Insert CP mobilisations
INSERT INTO cp_mobilisations (
    id, prevision_id, montant_mobilise, date_mobilisation, statut, 
    motif_rejet, created_by, updated_by
) VALUES
    ('mob11111-1111-1111-1111-111111111111', 'cp111111-1111-1111-1111-111111111111', 150000000, '2024-01-20', 'validé', NULL, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('mob22222-2222-2222-2222-222222222222', 'cp333333-3333-3333-3333-333333333333', 100000000, '2024-01-15', 'validé', NULL, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    ('mob33333-3333-3333-3333-333333333333', 'cp444444-4444-4444-4444-444444444444', 80000000, '2024-03-25', 'validé', NULL, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222');

-- Insert CP consommations
INSERT INTO cp_consommations (
    id, prevision_id, payment_id, montant_consomme, date_consommation, created_by
) VALUES
    ('cons1111-1111-1111-1111-111111111111', 'cp111111-1111-1111-1111-111111111111', 'pay11111-1111-1111-1111-111111111111', 100000000, '2024-02-15', '11111111-1111-1111-1111-111111111111'),
    ('cons2222-2222-2222-2222-222222222222', 'cp333333-3333-3333-3333-333333333333', 'pay22222-2222-2222-2222-222222222222', 80000000, '2024-02-10', '22222222-2222-2222-2222-222222222222');

-- Insert CP alertes
INSERT INTO cp_alertes (
    id, prevision_id, type_alerte, message, statut, resolved_at
) VALUES
    ('alert111-1111-1111-1111-111111111111', 'cp222222-2222-2222-2222-222222222222', 'retard_mobilisation', 'Retard mobilisation CP Q2 2024 Lycée Alger', 'active', NULL),
    ('alert222-2222-2222-2222-222222222222', 'cp444444-4444-4444-4444-444444444444', 'insuffisance_montant', 'Montant mobilisé insuffisant CHU Oran Q2 2024', 'active', NULL);

-- Insert budget_allocations for 2025
INSERT INTO budget_allocations (id, portfolio_id, program_id, action_id, amount, fiscal_year, created_at) VALUES
    -- Présidence allocations
    ('ba111111-1111-1111-1111-111111111111', '11111111-0000-4000-a000-000000000001', '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'ac111111-1111-1111-1111-111111111111', 15000000000, 2025, CURRENT_TIMESTAMP),
    ('ba222222-2222-2222-2222-222222222222', '11111111-0000-4000-a000-000000000001', '22222222-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'ac222222-2222-2222-2222-222222222222', 8000000000, 2025, CURRENT_TIMESTAMP),
    
    -- Premier ministre allocations
    ('ba333333-3333-3333-3333-333333333333', '22222222-1111-4111-b111-111111111112', '33333333-cccc-4ccc-cccc-cccccccccccc', 'ac333333-3333-3333-3333-333333333333', 12000000000, 2025, CURRENT_TIMESTAMP),
    ('ba444444-4444-4444-4444-444444444444', '22222222-1111-4111-b111-111111111112', '44444444-dddd-4ddd-dddd-dddddddddddd', 'ac444444-4444-4444-4444-444444444444', 9000000000, 2025, CURRENT_TIMESTAMP),
    
    -- Défense allocations
    ('ba555555-5555-5555-5555-555555555555', '33333333-2222-4222-c222-222222222223', '55555555-eeee-4eee-eeee-eeeeeeeeeeee', 'ac555555-5555-5555-5555-555555555555', 250000000000, 2025, CURRENT_TIMESTAMP),
    ('ba666666-6666-6666-6666-666666666666', '33333333-2222-4222-c222-222222222223', '66666666-ffff-4fff-ffff-ffffffffffff', 'ac666666-6666-6666-6666-666666666666', 80000000000, 2025, CURRENT_TIMESTAMP),
    
    -- Energie allocations
    ('ba777777-7777-7777-7777-777777777777', '55555555-4444-4444-e444-444444444445', '77777777-aaaa-5aaa-aaaa-aaaaaaaaaaaa', 'ac777777-7777-7777-7777-777777777777', 45000000000, 2025, CURRENT_TIMESTAMP),
    ('ba888888-8888-8888-8888-888888888888', '55555555-4444-4444-e444-444444444445', '88888888-bbbb-5bbb-bbbb-bbbbbbbbbbbb', 'ac888888-8888-8888-8888-888888888888', 35000000000, 2025, CURRENT_TIMESTAMP);

-- Insert financial operations for 2025
WITH user_id AS (SELECT id FROM users LIMIT 1)
INSERT INTO financial_operations (id, portfolio_id, program_id, action_id, amount, operation_type, operation_date, description, created_at)
SELECT 
    'rev11111-1111-1111-1111-111111111111',
    '11111111-0000-4000-a000-000000000001',
    '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    'ac111111-1111-1111-1111-111111111111',
    5000000000,
    'revenue',
    '2025-01-15',
    'Revenue Q1 2025 Présidence',
    CURRENT_TIMESTAMP
UNION ALL
SELECT
    'rev22222-2222-2222-2222-222222222222',
    '11111111-0000-4000-a000-000000000001',
    '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    'ac111111-1111-1111-1111-111111111111',
    3000000000,
    'expense',
    '2025-02-20',
    'Expense Q1 2025 Présidence',
    CURRENT_TIMESTAMP;

-- Insert credit payments
WITH user_id AS (SELECT id FROM users LIMIT 1)
INSERT INTO credit_payments (
    id, program_id, fiscal_year, quarter, 
    initial_amount, revised_amount, engaged_amount, paid_amount, 
    status, payment_date, description, created_by, updated_by
)
SELECT 
    'cp111111-1111-1111-1111-111111111111',
    '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    2024,
    '2024-Q1',
    6700150000,
    6700150000,
    6700150000,
    5000000000,
    'mobilisé',
    '2024-01-15',
    'CP Q1 2024 Présidence',
    u.id,
    u.id
FROM user_id u
UNION ALL
SELECT 
    'cp222222-2222-2222-2222-222222222222',
    '11111111-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    2024,
    '2024-Q2',
    1089700000,
    1089700000,
    0,
    0,
    'demandé',
    '2024-03-20',
    'CP Q2 2024 Présidence',
    u.id,
    u.id
FROM user_id u;

-- Insert engagements for 2025
INSERT INTO engagements (id, operation_id, amount, status, description, created_at) VALUES
    -- Présidence engagements
    ('en111111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', 4800000000, 'PENDING', 'Engagement pour modernisation des services présidentiels', CURRENT_TIMESTAMP),
    ('en222222-2222-2222-2222-222222222222', 'op222222-2222-2222-2222-222222222222', 2900000000, 'APPROVED', 'Engagement pour rénovation du palais présidentiel', CURRENT_TIMESTAMP),
    
    -- Premier ministre engagements
    ('en333333-3333-3333-3333-333333333333', 'op333333-3333-3333-3333-333333333333', 3800000000, 'PENDING', 'Engagement pour digitalisation des services', CURRENT_TIMESTAMP),
    ('en444444-4444-4444-4444-444444444444', 'op444444-4444-4444-4444-444444444444', 2400000000, 'APPROVED', 'Engagement pour modernisation fonction publique', CURRENT_TIMESTAMP),
    
    -- Défense engagements
    ('en555555-5555-5555-5555-555555555555', 'op555555-5555-5555-5555-555555555555', 70000000000, 'APPROVED', 'Engagement pour acquisition équipements militaires', CURRENT_TIMESTAMP),
    ('en666666-6666-6666-6666-666666666666', 'op666666-6666-6666-6666-666666666666', 42000000000, 'PENDING', 'Engagement pour construction bases militaires', CURRENT_TIMESTAMP),
    
    -- Energie engagements
    ('en777777-7777-7777-7777-777777777777', 'op777777-7777-7777-7777-777777777777', 14000000000, 'APPROVED', 'Engagement pour extension réseau électrique', CURRENT_TIMESTAMP),
    ('en888888-8888-8888-8888-888888888888', 'op888888-8888-8888-8888-888888888888', 11500000000, 'PENDING', 'Engagement pour projet énergie solaire', CURRENT_TIMESTAMP),
    
    -- Intérieur engagements
    ('en999999-9999-9999-9999-999999999999', 'op999999-9999-9999-9999-999999999999', 7500000000, 'APPROVED', 'Engagement pour modernisation état civil', CURRENT_TIMESTAMP),
    ('enaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'opbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5800000000, 'PENDING', 'Engagement pour équipement forces de police', CURRENT_TIMESTAMP); 