-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create system_parameters table
CREATE TABLE system_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module TEXT NOT NULL,
    parameter_key TEXT NOT NULL,
    parameter_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(module, parameter_key)
);

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    module TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create role_permissions table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(role_id, permission_id)
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company_id UUID REFERENCES companies(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create error_logs table
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create programs table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create operations table
CREATE TABLE operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create engagements table
CREATE TABLE engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    reference TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagements(id),
    operation_id UUID NOT NULL REFERENCES operations(id),
    amount DECIMAL(15,2) NOT NULL,
    request_date DATE NOT NULL,
    payment_date DATE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    beneficiary TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payment_requests table
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagements(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    operation_id UUID NOT NULL REFERENCES operations(id),
    amount DECIMAL(15,2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
    start_date DATE NOT NULL,
    request_date DATE NOT NULL,
    approved_date DATE,
    status TEXT NOT NULL CHECK (status IN ('pending_officer', 'pending_accountant', 'approved', 'rejected')),
    requested_by TEXT NOT NULL,
    beneficiary TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create ministers table
CREATE TABLE ministers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    minister_id UUID NOT NULL REFERENCES ministers(id),
    year INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create budget_lines table
CREATE TABLE budget_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create actions table
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cp_forecasts table (Prévisions CP - Crédits de Paiement)
CREATE TABLE cp_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    engagement_id UUID NOT NULL REFERENCES engagements(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    amount DECIMAL(15,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    requested_by TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    type TEXT NOT NULL CHECK (type IN ('progress', 'financial', 'audit', 'evaluation')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    report_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create audits table
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    auditor TEXT NOT NULL,
    audit_date DATE NOT NULL,
    findings TEXT NOT NULL,
    recommendations TEXT,
    status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create audit_followups table
CREATE TABLE audit_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id),
    action_taken TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert test data into system_parameters
INSERT INTO system_parameters (id, module, parameter_key, parameter_value, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'system', 'app_name', 'SIB', 'Nom de l''application'),
    ('22222222-2222-2222-2222-222222222222', 'system', 'app_version', '1.0.0', 'Version de l''application'),
    ('33333333-3333-3333-3333-333333333333', 'email', 'smtp_host', 'smtp.example.com', 'Serveur SMTP'),
    ('44444444-4444-4444-4444-444444444444', 'email', 'smtp_port', '587', 'Port SMTP');

-- Insert test data into companies
INSERT INTO companies (id, name, code, address, phone, email) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Entreprise ABC', 'ABC001', '123 Rue Example', '+1234567890', 'contact@abc.com'),
    ('22222222-2222-2222-2222-222222222222', 'Société XYZ', 'XYZ001', '456 Avenue Test', '+0987654321', 'contact@xyz.com');

-- Insert test data into roles
INSERT INTO roles (id, name, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin', 'Administrateur système'),
    ('22222222-2222-2222-2222-222222222222', 'manager', 'Gestionnaire'),
    ('33333333-3333-3333-3333-333333333333', 'user', 'Utilisateur standard');

-- Insert test data into permissions
INSERT INTO permissions (id, name, description, module) VALUES
    ('11111111-1111-1111-1111-111111111111', 'view_dashboard', 'Voir le tableau de bord', 'dashboard'),
    ('22222222-2222-2222-2222-222222222222', 'manage_users', 'Gérer les utilisateurs', 'users'),
    ('33333333-3333-3333-3333-333333333333', 'manage_roles', 'Gérer les rôles', 'roles'),
    ('44444444-4444-4444-4444-444444444444', 'manage_payments', 'Gérer les paiements', 'payments');

-- Insert test data into role_permissions
INSERT INTO role_permissions (id, role_id, permission_id) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333');

-- Insert test data into users
INSERT INTO users (id, username, email, password_hash, first_name, last_name, company_id, role_id) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin', 'admin@example.com', 'hashed_password', 'Admin', 'System', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222', 'manager', 'manager@example.com', 'hashed_password', 'Manager', 'User', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222');

-- Insert test data into audit_logs
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'create', 'user', '22222222-2222-2222-2222-222222222222', NULL, '{"username": "manager", "email": "manager@example.com"}'),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'update', 'role', '22222222-2222-2222-2222-222222222222', '{"name": "manager"}', '{"name": "manager", "description": "Gestionnaire"}');

-- Insert test data into activity_logs
INSERT INTO activity_logs (id, user_id, action, description) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'login', 'Connexion réussie'),
    ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'view_dashboard', 'Consultation du tableau de bord');

-- Insert test data into error_logs
INSERT INTO error_logs (id, user_id, error_type, error_message) VALUES
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'validation_error', 'Données invalides'),
    ('22222222-2222-2222-2222-222222222222', NULL, 'system_error', 'Erreur de connexion à la base de données');

-- Insert test data into portfolios
INSERT INTO portfolios (id, name, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Portfolio Éducation', 'Portfolio pour les projets éducatifs'),
    ('22222222-2222-2222-2222-222222222222', 'Portfolio Santé', 'Portfolio pour les projets de santé'),
    ('33333333-3333-3333-3333-333333333333', 'Portfolio Infrastructures', 'Portfolio pour les projets d''infrastructure'),
    ('44444444-4444-4444-4444-444444444444', 'Portfolio Agriculture', 'Portfolio pour les projets agricoles');

-- Insert test data into programs
INSERT INTO programs (id, portfolio_id, name, description) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Programme Éducation', 'Programme pour l''éducation de base'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Programme Santé', 'Programme pour la santé publique'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Programme Infrastructures', 'Programme pour les infrastructures'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Programme Agriculture', 'Programme pour l''agriculture'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Programme Formation', 'Programme pour la formation professionnelle');

-- Insert test data into operations
INSERT INTO operations (id, program_id, name, description) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Construction École Primaire de Koné', 'Construction d''une école primaire'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Équipement Hôpital Central', 'Équipement d''un hôpital'),
    ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rénovation Route Nationale 1', 'Rénovation d''une route nationale'),
    ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Installation Système d''Irrigation', 'Installation d''un système d''irrigation'),
    ('eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Formation des Enseignants', 'Formation des enseignants');

-- Insert test data into engagements
INSERT INTO engagements (id, operation_id, reference, description) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'ENG/2023/001', 'Engagement pour construction école'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222', 'ENG/2023/008', 'Engagement pour équipement hôpital'),
    ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333', 'ENG/2023/012', 'Engagement pour rénovation route'),
    ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444', 'ENG/2023/025', 'Engagement pour système d''irrigation'),
    ('eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-5555-5555-5555-555555555555', 'ENG/2023/030', 'Engagement pour formation enseignants');

-- Insert test data into payments
INSERT INTO payments (
    id, engagement_id, operation_id, amount, request_date, payment_date, 
    status, beneficiary, description
) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111',
     35000000, '2023-05-10', '2023-05-20', 'paid', 'Entreprise ABC Construction', 'Premier paiement pour travaux de fondation'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111',
     45000000, '2023-07-15', '2023-07-30', 'paid', 'Entreprise ABC Construction', 'Deuxième paiement pour travaux de structure'),
    ('cccccccc-3333-3333-3333-333333333333', 'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222',
     40000000, '2023-06-05', '2023-06-18', 'paid', 'MedEquip International', 'Paiement pour fourniture d''équipements médicaux'),
    ('dddddddd-4444-4444-4444-444444444444', 'cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333',
     60000000, '2023-08-10', '2023-08-28', 'paid', 'Routes & Ponts SA', 'Premier paiement pour travaux de terrassement'),
    ('eeeeeeee-5555-5555-5555-555555555555', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111',
     15000000, '2023-09-20', NULL, 'approved', 'Entreprise ABC Construction', 'Troisième paiement pour travaux de finition'),
    ('ffffffff-6666-6666-6666-666666666666', 'dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444',
     18000000, '2023-10-05', NULL, 'pending', 'Institut de Formation Pédagogique', 'Paiement pour services de formation'),
    ('aaaaaaaa-7777-7777-7777-777777777777', 'eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-5555-5555-5555-555555555555',
     25000000, '2023-09-15', NULL, 'rejected', 'Santé Pour Tous', 'Paiement pour vaccins et matériel médical'),
    ('bbbbbbbb-8888-8888-8888-888888888888', 'cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333',
     35000000, '2023-10-10', NULL, 'pending', 'Routes & Ponts SA', 'Deuxième paiement pour travaux de revêtement'),
    ('cccccccc-9999-9999-9999-999999999999', 'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222',
     28000000, '2023-11-01', '2023-11-15', 'paid', 'AgroFood Services', 'Paiement pour fourniture de repas scolaires'),
    ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444',
     42000000, '2023-11-15', NULL, 'approved', 'IrrigationTech SA', 'Paiement pour installation du système d''irrigation');

-- Insert test data into payment_requests
INSERT INTO payment_requests (
    id, engagement_id, program_id, operation_id, amount, frequency, 
    start_date, request_date, approved_date, status, requested_by, 
    beneficiary, description
) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-111111111111',
     35000000, 'monthly', '2023-05-01', '2023-05-10', '2023-05-15', 'approved', 'John Doe',
     'Entreprise ABC Construction', 'Premier paiement pour travaux de fondation'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-2222-2222-222222222222',
     40000000, 'quarterly', '2023-06-01', '2023-06-05', '2023-06-10', 'approved', 'Jane Smith',
     'MedEquip International', 'Paiement pour fourniture d''équipements médicaux'),
    ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-3333-3333-3333-333333333333',
     60000000, 'annual', '2023-08-01', '2023-08-10', NULL, 'pending_officer', 'Mike Johnson',
     'Routes & Ponts SA', 'Premier paiement pour travaux de terrassement'),
    ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-4444-4444-4444-444444444444',
     18000000, 'quarterly', '2023-10-01', '2023-10-05', NULL, 'pending_accountant', 'Sarah Wilson',
     'Institut de Formation Pédagogique', 'Paiement pour services de formation'),
    ('eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-5555-5555-5555-555555555555',
     25000000, 'monthly', '2023-09-01', '2023-09-15', NULL, 'rejected', 'David Brown',
     'Santé Pour Tous', 'Paiement pour vaccins et matériel médical'),
    ('ffffffff-6666-6666-6666-666666666666', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-111111111111',
     28000000, 'monthly', '2023-11-01', '2023-11-01', '2023-11-10', 'approved', 'Emma Davis',
     'AgroFood Services', 'Paiement pour fourniture de repas scolaires'),
    ('aaaaaaaa-7777-7777-7777-777777777777', 'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-2222-2222-222222222222',
     42000000, 'quarterly', '2023-11-15', '2023-11-15', NULL, 'pending_officer', 'Robert Wilson',
     'IrrigationTech SA', 'Paiement pour installation du système d''irrigation'),
    ('bbbbbbbb-8888-8888-8888-888888888888', 'cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-3333-3333-3333-333333333333',
     55000000, 'annual', '2023-12-01', '2023-12-01', NULL, 'pending_accountant', 'Sophie Martin',
     'Bibliothèque Plus SA', 'Paiement pour construction de la bibliothèque'),
    ('cccccccc-9999-9999-9999-999999999999', 'dddddddd-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-4444-4444-4444-444444444444',
     32000000, 'quarterly', '2023-12-15', '2023-12-15', NULL, 'pending_officer', 'Pierre Dubois',
     'MedRural Services', 'Paiement pour équipement médical'),
    ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-5555-5555-5555-555555555555',
     48000000, 'annual', '2024-01-01', '2024-01-01', NULL, 'pending_accountant', 'Marie Laurent',
     'Ponts & Routes SA', 'Paiement pour construction du pont'),
    ('eeeeeeee-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-111111111111',
     22000000, 'monthly', '2024-01-15', '2024-01-15', NULL, 'pending_officer', 'Thomas Bernard',
     'FormPro Institute', 'Paiement pour formation professionnelle'),
    ('ffffffff-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-2222-2222-222222222222',
     30000000, 'quarterly', '2024-02-01', '2024-02-01', NULL, 'pending_accountant', 'Claire Moreau',
     'SantéPlus NGO', 'Paiement pour programme de prévention'),
    ('aaaaaaaa-dddd-dddd-dddd-dddddddddddd', 'cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-3333-3333-3333-333333333333',
     15000000, 'annual', '2024-02-15', '2024-02-15', NULL, 'pending_officer', 'Lucas Petit',
     'AgroDistrib SA', 'Paiement pour distribution de semences'),
    ('bbbbbbbb-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-4444-4444-4444-444444444444',
     75000000, 'annual', '2024-03-01', '2024-03-01', NULL, 'pending_accountant', 'Julie Martin',
     'ÉducationPlus SA', 'Paiement pour construction du collège'),
    ('cccccccc-ffff-ffff-ffff-ffffffffffff', 'eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-5555-5555-5555-555555555555',
     45000000, 'quarterly', '2024-03-15', '2024-03-15', NULL, 'pending_officer', 'Marc Laurent',
     'LabTech International', 'Paiement pour équipement de laboratoire'),
    ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-111111111111',
     38000000, 'annual', '2024-04-01', '2024-04-01', NULL, 'pending_accountant', 'Sophie Dubois',
     'MarchéPlus SA', 'Paiement pour rénovation du marché'),
    ('eeeeeeee-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-2222-2222-222222222222',
     20000000, 'monthly', '2024-04-15', '2024-04-15', NULL, 'pending_officer', 'Paul Bernard',
     'AlphabétisationPlus', 'Paiement pour programme d''alphabétisation'),
    ('ffffffff-cccc-cccc-cccc-cccccccccccc', 'cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-3333-3333-3333-333333333333',
     35000000, 'quarterly', '2024-05-01', '2024-05-01', NULL, 'pending_accountant', 'Marie Moreau',
     'VaccinPlus SA', 'Paiement pour campagne de vaccination'),
    ('aaaaaaaa-dddd-dddd-dddd-dddddddddddd', 'dddddddd-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-4444-4444-4444-444444444444',
     28000000, 'annual', '2024-05-15', '2024-05-15', NULL, 'pending_officer', 'Thomas Laurent',
     'IrrigationPlus SA', 'Paiement pour système d''irrigation'),
    ('bbbbbbbb-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-5555-5555-5555-555555555555',
     42000000, 'annual', '2024-06-01', '2024-06-01', NULL, 'pending_accountant', 'Claire Martin',
     'ÉducationMaternelle SA', 'Paiement pour construction école maternelle'),
    ('cccccccc-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-111111111111',
     65000000, 'quarterly', '2024-06-15', '2024-06-15', NULL, 'pending_officer', 'Lucas Dubois',
     'DialysePlus SA', 'Paiement pour équipement de dialyse');

-- Insert test data into ministers
INSERT INTO ministers (id, name, title, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Jean Dupont', 'Ministre de l''Éducation', 'Ministre en charge de l''éducation nationale'),
    ('22222222-2222-2222-2222-222222222222', 'Marie Martin', 'Ministre de la Santé', 'Ministre en charge de la santé publique'),
    ('33333333-3333-3333-3333-333333333333', 'Pierre Dubois', 'Ministre des Infrastructures', 'Ministre en charge des travaux publics'),
    ('44444444-4444-4444-4444-444444444444', 'Sophie Laurent', 'Ministre de l''Agriculture', 'Ministre en charge du développement rural');

-- Insert test data into budgets
INSERT INTO budgets (id, minister_id, year, total_amount, status) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 2023, 1500000000, 'approved'),
    ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 2023, 2000000000, 'approved'),
    ('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 2023, 2500000000, 'approved'),
    ('dddddddd-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 2023, 1000000000, 'approved'),
    ('eeeeeeee-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 2024, 1600000000, 'draft');

-- Insert test data into budget_lines
INSERT INTO budget_lines (id, budget_id, program_id, amount, description) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 800000000, 'Budget pour l''éducation de base'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1200000000, 'Budget pour la santé publique'),
    ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1500000000, 'Budget pour les infrastructures'),
    ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 600000000, 'Budget pour l''agriculture');

-- Insert test data into actions
INSERT INTO actions (id, operation_id, name, description, start_date, end_date, status) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'Préparation du site', 'Préparation du terrain pour la construction', '2023-05-01', '2023-05-15', 'completed'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'aaaaaaaa-1111-1111-1111-111111111111', 'Construction fondations', 'Construction des fondations de l''école', '2023-05-16', '2023-06-15', 'completed'),
    ('cccccccc-3333-3333-3333-333333333333', 'bbbbbbbb-2222-2222-2222-222222222222', 'Installation équipements', 'Installation des équipements médicaux', '2023-06-01', '2023-06-30', 'completed'),
    ('dddddddd-4444-4444-4444-444444444444', 'cccccccc-3333-3333-3333-333333333333', 'Terrassement route', 'Travaux de terrassement de la route', '2023-08-01', '2023-09-15', 'in_progress'),
    ('eeeeeeee-5555-5555-5555-555555555555', 'dddddddd-4444-4444-4444-444444444444', 'Installation système', 'Installation du système d''irrigation', '2023-11-01', NULL, 'planned');

-- Insert test data into cp_forecasts
INSERT INTO cp_forecasts (
    id, operation_id, engagement_id, program_id, year, quarter, 
    amount, status, requested_by, description
) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 
     'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     2023, 2, 35000000, 'approved', 'Jean Dupont', 'Prévision CP Q2 2023 pour construction école'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'aaaaaaaa-1111-1111-1111-111111111111', 
     'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     2023, 3, 45000000, 'approved', 'Jean Dupont', 'Prévision CP Q3 2023 pour construction école'),
    ('cccccccc-3333-3333-3333-333333333333', 'bbbbbbbb-2222-2222-2222-222222222222', 
     'bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     2023, 2, 40000000, 'approved', 'Marie Martin', 'Prévision CP Q2 2023 pour équipement hôpital'),
    ('dddddddd-4444-4444-4444-444444444444', 'cccccccc-3333-3333-3333-333333333333', 
     'cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
     2023, 3, 60000000, 'approved', 'Pierre Dubois', 'Prévision CP Q3 2023 pour rénovation route'),
    ('eeeeeeee-5555-5555-5555-555555555555', 'aaaaaaaa-1111-1111-1111-111111111111', 
     'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     2023, 4, 15000000, 'submitted', 'Jean Dupont', 'Prévision CP Q4 2023 pour construction école');

-- Insert test data into reports
INSERT INTO reports (id, operation_id, type, title, content, report_date, status) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'progress', 'Rapport d''avancement Q2 2023', 'Rapport détaillé des travaux réalisés', '2023-06-30', 'approved'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222', 'financial', 'Rapport financier Q2 2023', 'État des dépenses et engagements', '2023-06-30', 'approved'),
    ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333', 'progress', 'Rapport d''avancement Q3 2023', 'État d''avancement des travaux', '2023-09-30', 'submitted'),
    ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444', 'evaluation', 'Rapport d''évaluation mi-parcours', 'Évaluation des résultats intermédiaires', '2023-10-15', 'draft');

-- Insert test data into audits
INSERT INTO audits (id, operation_id, auditor, audit_date, findings, recommendations, status) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'Cabinet Audit Plus', '2023-07-15', 'Conformité générale, quelques points à améliorer', 'Renforcer le suivi des dépenses', 'completed'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222', 'Cabinet Audit Plus', '2023-08-20', 'Non-conformités mineures identifiées', 'Améliorer la documentation', 'completed'),
    ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333', 'Cabinet Audit Plus', '2023-09-10', 'Audit en cours', 'En attente de finalisation', 'in_progress'),
    ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444', 'Cabinet Audit Plus', '2023-10-01', 'Planification de l''audit', 'À planifier', 'planned');

-- Insert test data into audit_followups
INSERT INTO audit_followups (id, audit_id, action_taken, status, due_date) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'Mise en place d''un système de suivi des dépenses', 'completed', '2023-08-15'),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222', 'Formation du personnel à la documentation', 'completed', '2023-09-20'),
    ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333', 'Mise à jour des procédures', 'in_progress', '2023-10-10'),
    ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444', 'Planification des actions correctives', 'pending', '2023-11-01'); 