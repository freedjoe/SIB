CREATE TABLE IF NOT EXISTS program_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10),
    name_fr TEXT,
    name_ar TEXT,
    name_en TEXT
);

INSERT INTO program_types (code, name_fr, name_ar, name_en) VALUES
('PSD',     'Programme Sectoriel Déconcentré', 'البرنامج القطاعي غير المركزي', 'Decentralized Sector Program'),
('PC',      'Programme Complémentaire',         'برنامج تكميلي',                'Complementary Program'),
('EX-PSD',  'Ex-Programme Sectoriel Déconcentré','البرنامج القطاعي غير المركزي السابق', 'Former Decentralized Sector Program'),
('CENTRAL', 'Programme Centralisé',             'برنامج مركزي',                  'Centralized Program'),
('NEUF',    'Programme Neuf',                   'برنامج جديد',                   'New Program'),
('PSC',     'Programme Spécial Communal',       'البرنامج الخاص بالبلدية',       'Special Communal Program'),
('PN',      'Programme National',               'برنامج وطني',                   'National Program'),
('PEC',     'Programme d’Équipement Complémentaire', 'برنامج تجهيز تكميلي',      'Complementary Equipment Program'),
('LOLF',    'Programme LOLF',                   'برنامج الميزانية حسب الأهداف',   'LOLF Program'),
('PROG',    'Programme',                        'برنامج',                        'Program');
