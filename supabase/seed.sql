-- Insert test data for CP module

-- Insert CP prévisions
INSERT INTO cp_previsions (
    id, programme_id, exercice, periode, montant_prevu, montant_demande, 
    montant_mobilise, montant_consomme, statut, date_soumission, notes, 
    created_by, updated_by
) VALUES
    -- Programme Éducation
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2024, '2024-Q1', 50000000, 50000000, 45000000, 30000000, 'mobilisé', '2024-01-15', 'Prévision Q1 2024 pour construction école', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2024, '2024-Q2', 60000000, 60000000, 0, 0, 'demandé', '2024-03-20', 'Prévision Q2 2024 pour construction école', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2024, '2024-Q3', 55000000, 0, 0, 0, 'prévu', NULL, 'Prévision Q3 2024 pour construction école', '11111111-1111-1111-1111-111111111111', NULL),
    
    -- Programme Santé
    ('dddddddd-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2024, '2024-Q1', 45000000, 45000000, 45000000, 20000000, 'mobilisé', '2024-01-10', 'Prévision Q1 2024 pour équipement hôpital', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    ('eeeeeeee-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2024, '2024-Q2', 50000000, 50000000, 30000000, 0, 'partiellement mobilisé', '2024-03-15', 'Prévision Q2 2024 pour équipement hôpital', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    
    -- Programme Infrastructures
    ('ffffffff-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2024, '2024-Q1', 70000000, 70000000, 0, 0, 'en retard', '2024-01-05', 'Prévision Q1 2024 pour rénovation route', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'),
    ('aaaaaaaa-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2024, '2024-Q2', 75000000, 0, 0, 0, 'prévu', NULL, 'Prévision Q2 2024 pour rénovation route', '33333333-3333-3333-3333-333333333333', NULL);

-- Insert CP mobilisations
INSERT INTO cp_mobilisations (
    id, prevision_id, montant_mobilise, date_mobilisation, statut, 
    motif_rejet, created_by, updated_by
) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 45000000, '2024-01-20', 'validé', NULL, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'dddddddd-4444-4444-4444-444444444444', 45000000, '2024-01-15', 'validé', NULL, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-3333-3333-3333-333333333333', 'eeeeeeee-5555-5555-5555-555555555555', 30000000, '2024-03-25', 'validé', NULL, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    ('dddddddd-4444-4444-4444-444444444444', 'ffffffff-6666-6666-6666-666666666666', 0, '2024-01-20', 'rejeté', 'Montant non disponible pour ce trimestre', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333');

-- Insert CP consommations
INSERT INTO cp_consommations (
    id, prevision_id, payment_id, montant_consomme, date_consommation, created_by
) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 30000000, '2024-02-15', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'dddddddd-4444-4444-4444-444444444444', 'bbbbbbbb-2222-2222-2222-222222222222', 20000000, '2024-02-10', '22222222-2222-2222-2222-222222222222');

-- Insert CP alertes
INSERT INTO cp_alertes (
    id, prevision_id, type_alerte, message, statut, resolved_at
) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'ffffffff-6666-6666-6666-666666666666', 'retard_mobilisation', 'Mobilisation des CP en retard pour le programme Infrastructures Q1 2024', 'active', NULL),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'eeeeeeee-5555-5555-5555-555555555555', 'insuffisance_montant', 'Montant mobilisé insuffisant pour couvrir les besoins du programme Santé Q2 2024', 'active', NULL);

-- Insert CP historique
INSERT INTO cp_historique (
    id, prevision_id, action, ancienne_valeur, nouvelle_valeur, user_id
) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'création', NULL, '{"montant_prevu": 50000000, "periode": "2024-Q1"}', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'aaaaaaaa-1111-1111-1111-111111111111', 'mobilisation', '{"montant_mobilise": 0}', '{"montant_mobilise": 45000000}', '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-3333-3333-3333-333333333333', 'dddddddd-4444-4444-4444-444444444444', 'création', NULL, '{"montant_prevu": 45000000, "periode": "2024-Q1"}', '22222222-2222-2222-2222-222222222222'); 