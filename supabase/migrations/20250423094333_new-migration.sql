-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = table_name 
        AND column_name = column_name
    );
END;
$$ LANGUAGE plpgsql;

-- Create enterprise types enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enterprise_type') THEN
        CREATE TYPE enterprise_type AS ENUM ('public', 'private', 'mixed');
    END IF;
END $$;

-- Create user types enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM (
            'ordonnateur',
            'comptable',
            'controleur_financier',
            'tresorier',
            'directeur',
            'ministre',
            'president',
            'admin',
            'gestionnaire'
        );
    END IF;
END $$;

-- Create or update system_parameters table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'system_parameters') THEN
        CREATE TABLE system_parameters (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            module TEXT NOT NULL,
            parameter_key TEXT NOT NULL,
            parameter_value TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            UNIQUE(module, parameter_key)
        );
    END IF;
END $$;

-- Create or update companies table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies') THEN
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            address TEXT,
            phone TEXT,
            email TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update roles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'roles') THEN
        CREATE TABLE roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update permissions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'permissions') THEN
        CREATE TABLE permissions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            module TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update role_permissions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'role_permissions') THEN
        CREATE TABLE role_permissions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            role_id UUID NOT NULL REFERENCES roles(id),
            permission_id UUID NOT NULL REFERENCES permissions(id),
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            UNIQUE(role_id, permission_id)
        );
    END IF;
END $$;

-- Create or update users table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
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
            last_login TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Safely create or update operations table
CREATE TABLE IF NOT EXISTS operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    ministry_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    year INTEGER,
    status TEXT,
    observation TEXT
);

-- Add foreign key if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'operations_ministry_id_fkey'
    ) THEN
        ALTER TABLE operations 
        ADD CONSTRAINT operations_ministry_id_fkey 
        FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Safely create or update engagements table
CREATE TABLE IF NOT EXISTS engagements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operation_id UUID,
    amount DECIMAL(15,2) NOT NULL,
    engagement_date DATE NOT NULL,
    exercice INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT
);

-- Add foreign key if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'engagements_operation_id_fkey'
    ) THEN
        ALTER TABLE engagements 
        ADD CONSTRAINT engagements_operation_id_fkey 
        FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create or update prevision_cp table with additional fields and constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'prevision_cp') THEN
        CREATE TABLE prevision_cp (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
            operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
            exercice INTEGER NOT NULL,
            periode VARCHAR(7) NOT NULL,
            montant_prevu DECIMAL(15,2) NOT NULL,
            montant_demande DECIMAL(15,2),
            montant_mobilise DECIMAL(15,2),
            montant_consomme DECIMAL(15,2),
            statut VARCHAR(20) NOT NULL DEFAULT 'prévu',
            date_soumission TIMESTAMPTZ,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT ck_prevision_cp_periode CHECK (periode ~ '^[0-9]{4}-Q[1-4]$'),
            CONSTRAINT ck_prevision_cp_exercice CHECK (exercice >= 2000 AND exercice <= 2100),
            CONSTRAINT ck_prevision_cp_periode_exercice CHECK (CAST(SUBSTRING(periode, 1, 4) AS INTEGER) = exercice),
            CONSTRAINT uq_prevision_cp_engagement_periode UNIQUE (engagement_id, periode)
        );
    ELSE
        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prevision_cp' AND column_name = 'periode') THEN
            ALTER TABLE prevision_cp ADD COLUMN periode VARCHAR(7) NOT NULL DEFAULT '2024-Q1';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prevision_cp' AND column_name = 'montant_prevu') THEN
            ALTER TABLE prevision_cp ADD COLUMN montant_prevu DECIMAL(15,2) NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prevision_cp' AND column_name = 'montant_demande') THEN
            ALTER TABLE prevision_cp ADD COLUMN montant_demande DECIMAL(15,2);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prevision_cp' AND column_name = 'montant_mobilise') THEN
            ALTER TABLE prevision_cp ADD COLUMN montant_mobilise DECIMAL(15,2);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prevision_cp' AND column_name = 'montant_consomme') THEN
            ALTER TABLE prevision_cp ADD COLUMN montant_consomme DECIMAL(15,2);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prevision_cp' AND column_name = 'date_soumission') THEN
            ALTER TABLE prevision_cp ADD COLUMN date_soumission TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prevision_cp' AND column_name = 'notes') THEN
            ALTER TABLE prevision_cp ADD COLUMN notes TEXT;
        END IF;

        -- Add constraints if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_prevision_cp_periode') THEN
            ALTER TABLE prevision_cp ADD CONSTRAINT ck_prevision_cp_periode 
                CHECK (periode ~ '^[0-9]{4}-Q[1-4]$');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_prevision_cp_exercice') THEN
            ALTER TABLE prevision_cp ADD CONSTRAINT ck_prevision_cp_exercice 
                CHECK (exercice >= 2000 AND exercice <= 2100);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_prevision_cp_periode_exercice') THEN
            ALTER TABLE prevision_cp ADD CONSTRAINT ck_prevision_cp_periode_exercice 
                CHECK (CAST(SUBSTRING(periode, 1, 4) AS INTEGER) = exercice);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_prevision_cp_engagement_periode') THEN
            ALTER TABLE prevision_cp ADD CONSTRAINT uq_prevision_cp_engagement_periode 
                UNIQUE (engagement_id, periode);
        END IF;
    END IF;
END $$;

-- Add additional indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_prevision_cp_periode') THEN
        CREATE INDEX idx_prevision_cp_periode ON prevision_cp(periode);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_prevision_cp_statut') THEN
        CREATE INDEX idx_prevision_cp_statut ON prevision_cp(statut);
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_operations_ministry'
    ) THEN
        CREATE INDEX idx_operations_ministry ON operations(ministry_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_engagements_operation'
    ) THEN
        CREATE INDEX idx_engagements_operation ON engagements(operation_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_engagements_exercice'
    ) THEN
        CREATE INDEX idx_engagements_exercice ON engagements(exercice);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_prevision_cp_engagement'
    ) THEN
        CREATE INDEX idx_prevision_cp_engagement ON prevision_cp(engagement_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_prevision_cp_operation'
    ) THEN
        CREATE INDEX idx_prevision_cp_operation ON prevision_cp(operation_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_prevision_cp_exercice'
    ) THEN
        CREATE INDEX idx_prevision_cp_exercice ON prevision_cp(exercice);
    END IF;
END $$;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_operations_updated_at'
    ) THEN
        CREATE TRIGGER update_operations_updated_at
            BEFORE UPDATE ON operations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_engagements_updated_at'
    ) THEN
        CREATE TRIGGER update_engagements_updated_at
            BEFORE UPDATE ON engagements
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_prevision_cp_updated_at'
    ) THEN
        CREATE TRIGGER update_prevision_cp_updated_at
            BEFORE UPDATE ON prevision_cp
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE prevision_cp ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON operations;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON engagements;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON prevision_cp;

CREATE POLICY "Enable all access for authenticated users" ON operations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON engagements
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON prevision_cp
    FOR ALL USING (auth.role() = 'authenticated');

-- Create or update audit_logs table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_logs') THEN
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
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update activity_logs table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'activity_logs') THEN
        CREATE TABLE activity_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id),
            action TEXT NOT NULL,
            description TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update error_logs table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'error_logs') THEN
        CREATE TABLE error_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id),
            error_type TEXT NOT NULL,
            error_message TEXT NOT NULL,
            stack_trace TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update portfolios table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'portfolios') THEN
        CREATE TABLE portfolios (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            code TEXT
        );
    END IF;
END $$;

-- Add missing code column to portfolios if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' AND column_name = 'code'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN code TEXT UNIQUE;
    END IF;
END $$;

-- Add missing type column to engagements if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'engagements' AND column_name = 'type'
    ) THEN
        ALTER TABLE engagements ADD COLUMN type TEXT CHECK (type IN ('initial', 'adjusted', 'revalued'));
    END IF;
END $$;

-- Add missing timestamp columns if not exists
DO $$ 
BEGIN
    -- For portfolios
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;

    -- For programs
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programs' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE programs ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;

    -- For actions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'actions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE actions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;
END $$;

-- Create or update programs table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'programs') THEN
        CREATE TABLE programs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            portfolio_id UUID NOT NULL REFERENCES portfolios(id),
            name TEXT NOT NULL,
            description TEXT,
            code_programme TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update actions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'actions') THEN
        CREATE TABLE actions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            program_id UUID NOT NULL REFERENCES programs(id),
            name TEXT NOT NULL,
            description TEXT,
            code_action TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update operations table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'operations') THEN
        CREATE TABLE operations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            program_id UUID NOT NULL REFERENCES programs(id),
            action_id UUID NOT NULL REFERENCES actions(id),
            name TEXT NOT NULL,
            description TEXT,
            code_operation TEXT NOT NULL,
            wilaya TEXT NOT NULL,
            titre_budgetaire INTEGER NOT NULL CHECK (titre_budgetaire BETWEEN 1 AND 5),
            origine_financement TEXT NOT NULL CHECK (origine_financement IN ('budget_national', 'financement_exterieur')),
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update engagements table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'engagements') THEN
        CREATE TABLE engagements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            operation_id UUID NOT NULL REFERENCES operations(id),
            amount DECIMAL(15,2) NOT NULL,
            engagement_date DATE NOT NULL,
            exercice INTEGER NOT NULL,
            status TEXT DEFAULT 'PENDING',
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Create or update payments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments') THEN
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
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update cp_previsions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cp_previsions') THEN
        CREATE TABLE cp_previsions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            programme_id UUID NOT NULL REFERENCES programs(id),
            exercice INTEGER NOT NULL,
            periode TEXT NOT NULL,
            montant_prevu DECIMAL(15,2) NOT NULL,
            montant_demande DECIMAL(15,2) DEFAULT 0,
            montant_mobilise DECIMAL(15,2) DEFAULT 0,
            montant_consomme DECIMAL(15,2) DEFAULT 0,
            statut TEXT NOT NULL CHECK (statut IN ('prévu', 'demandé', 'mobilisé', 'en retard', 'partiellement mobilisé')),
            date_soumission DATE,
            notes TEXT,
            created_by UUID NOT NULL REFERENCES users(id),
            updated_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            UNIQUE(programme_id, exercice, periode)
        );
    END IF;
END $$;

-- Create or update cp_mobilisations table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cp_mobilisations') THEN
        CREATE TABLE cp_mobilisations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            prevision_id UUID NOT NULL REFERENCES cp_previsions(id),
            montant_mobilise DECIMAL(15,2) NOT NULL,
            date_mobilisation DATE NOT NULL,
            statut TEXT NOT NULL CHECK (statut IN ('en attente', 'validé', 'rejeté', 'ajusté')),
            motif_rejet TEXT,
            created_by UUID NOT NULL REFERENCES users(id),
            updated_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update cp_consommations table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cp_consommations') THEN
        CREATE TABLE cp_consommations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            prevision_id UUID NOT NULL REFERENCES cp_previsions(id),
            payment_id UUID NOT NULL REFERENCES payments(id),
            montant_consomme DECIMAL(15,2) NOT NULL,
            date_consommation DATE NOT NULL,
            created_by UUID NOT NULL REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create or update cp_alertes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cp_alertes') THEN
        CREATE TABLE cp_alertes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            prevision_id UUID NOT NULL REFERENCES cp_previsions(id),
            type_alerte TEXT NOT NULL CHECK (type_alerte IN ('retard_mobilisation', 'insuffisance_montant', 'delai_depassement')),
            message TEXT NOT NULL,
            statut TEXT NOT NULL CHECK (statut IN ('active', 'resolue', 'ignoree')),
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            resolved_at TIMESTAMPTZ
        );
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_cp_previsions_programme') THEN
        CREATE INDEX idx_cp_previsions_programme ON cp_previsions(programme_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_cp_previsions_exercice') THEN
        CREATE INDEX idx_cp_previsions_exercice ON cp_previsions(exercice);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_cp_previsions_statut') THEN
        CREATE INDEX idx_cp_previsions_statut ON cp_previsions(statut);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_cp_mobilisations_prevision') THEN
        CREATE INDEX idx_cp_mobilisations_prevision ON cp_mobilisations(prevision_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_cp_consommations_prevision') THEN
        CREATE INDEX idx_cp_consommations_prevision ON cp_consommations(prevision_id);
    END IF;
END $$;

-- Create triggers if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cp_previsions_updated_at') THEN
        CREATE TRIGGER update_cp_previsions_updated_at
            BEFORE UPDATE ON cp_previsions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cp_mobilisations_updated_at') THEN
        CREATE TRIGGER update_cp_mobilisations_updated_at
            BEFORE UPDATE ON cp_mobilisations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_previsions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_mobilisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_consommations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_alertes ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON operations;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON engagements;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON cp_previsions;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON cp_mobilisations;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON cp_consommations;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON cp_alertes;

    CREATE POLICY "Enable all access for authenticated users" ON operations
        FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all access for authenticated users" ON engagements
        FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all access for authenticated users" ON cp_previsions
        FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all access for authenticated users" ON cp_mobilisations
        FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all access for authenticated users" ON cp_consommations
        FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all access for authenticated users" ON cp_alertes
        FOR ALL USING (auth.role() = 'authenticated');
END $$;

-- Create or update engagement_revaluations table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'engagement_revaluations') THEN
        CREATE TABLE engagement_revaluations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            engagement_id UUID NOT NULL REFERENCES engagements(id),
            initial_amount DECIMAL(15,2) NOT NULL,
            proposed_amount DECIMAL(15,2) NOT NULL,
            reason TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
            requested_by UUID NOT NULL REFERENCES users(id),
            approved_by UUID REFERENCES users(id),
            approval_date TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
    END IF;
END $$;

-- Create indexes for engagement_revaluations if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_engagement_revaluations_engagement') THEN
        CREATE INDEX idx_engagement_revaluations_engagement ON engagement_revaluations(engagement_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_engagement_revaluations_status') THEN
        CREATE INDEX idx_engagement_revaluations_status ON engagement_revaluations(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_engagement_revaluations_requested_by') THEN
        CREATE INDEX idx_engagement_revaluations_requested_by ON engagement_revaluations(requested_by);
    END IF;
END $$;

-- Add trigger for engagement_revaluations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_engagement_revaluations_updated_at') THEN
        CREATE TRIGGER update_engagement_revaluations_updated_at
            BEFORE UPDATE ON engagement_revaluations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS for engagement_revaluations
ALTER TABLE engagement_revaluations ENABLE ROW LEVEL SECURITY;

-- Create policy for engagement_revaluations
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON engagement_revaluations;
    
    CREATE POLICY "Enable all access for authenticated users" ON engagement_revaluations
        FOR ALL USING (auth.role() = 'authenticated');
END $$;

-- Create or update ministries table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ministries') THEN
        CREATE TABLE ministries (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            parent_id UUID REFERENCES ministries(id)
        );
    END IF;
END $$;

-- Insert ministries data
INSERT INTO ministries (name, code) VALUES
    ('Présidence de la République', 'PR'),
    ('Services du Premier ministre', 'PM'),
    ('Défense nationale', 'MDN'),
    ('Affaires étrangères, communauté nationale à l''étranger et affaires africaines', 'MAE'),
    ('Energie, mines et énergies renouvelables', 'MEM'),
    ('Intérieur, collectivités locales et aménagement du territoire', 'MICLAT'),
    ('Education nationale', 'MEN'),
    ('Enseignement supérieur et recherche scientifique', 'MESRS'),
    ('Formation et enseignement professionnels', 'MFEP'),
    ('Jeunesse et sports', 'MJS'),
    ('Culture et arts', 'MCA'),
    ('Solidarité nationale, famille et condition de la femme', 'MSNFCF'),
    ('Industrie et production pharmaceutique', 'MIPP'),
    ('Agriculture et développement rural', 'MADR'),
    ('Habitat, urbanisme et ville', 'MHUV'),
    ('Commerce et promotion des exportations', 'MCPE'),
    ('Communication', 'MC'),
    ('Travaux publics et infrastructures de base', 'MTPIB'),
    ('Transports', 'MT'),
    ('Ressources en eau et sécurité hydrique', 'MRESH'),
    ('Tourisme et artisanat', 'MTA'),
    ('Santé', 'MS'),
    ('Travail, emploi et sécurité sociale', 'MTESS'),
    ('Relations avec le Parlement', 'MRP'),
    ('Environnement et énergies renouvelables', 'MEER'),
    ('Pêche et productions halieutiques', 'MPPH'),
    ('Numérique et statistiques', 'MNS'),
    ('Moudjahidine et ayants-droit', 'MMA'),
    ('Affaires religieuses et wakfs', 'MARW'),
    ('Finances', 'MF')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    updated_at = NOW();

-- Create wilayas table
CREATE TABLE wilayas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add wilaya reference to operations
ALTER TABLE operations
ADD COLUMN wilaya_id UUID REFERENCES wilayas(id);

-- Update budget_allocations table
ALTER TABLE budget_allocations 
ADD COLUMN allocated_ae BIGINT,
ADD COLUMN allocated_cp BIGINT;

-- Update financial_operations table
ALTER TABLE financial_operations 
ADD COLUMN executed_ae BIGINT,
ADD COLUMN executed_cp BIGINT,
ADD COLUMN execution_date DATE;

-- Create more_engagements_2025 table
CREATE TABLE more_engagements_2025 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID REFERENCES operations(id),
    requested_amount BIGINT,
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add created_at columns to tables that don't have it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wilayas' AND column_name = 'created_at') THEN
        ALTER TABLE wilayas ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Add missing ministries table if not exists
CREATE TABLE IF NOT EXISTS ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add missing budget_categories table if not exists
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add missing cp_alerts table if not exists
CREATE TABLE IF NOT EXISTS cp_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID REFERENCES operations(id),
    threshold_exceeded BOOLEAN NOT NULL DEFAULT false,
    alert_level TEXT CHECK (alert_level IN ('LOW', 'MEDIUM', 'HIGH')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add missing financial_operations table if not exists
CREATE TABLE IF NOT EXISTS financial_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID REFERENCES operations(id),
    executed_ae BIGINT NOT NULL,
    executed_cp BIGINT NOT NULL,
    execution_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add missing more_engagements_2025 table if not exists
CREATE TABLE IF NOT EXISTS more_engagements_2025 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID REFERENCES operations(id),
    requested_amount BIGINT NOT NULL,
    justification TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE more_engagements_2025 ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Enable all access for authenticated users" ON ministries
    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON budget_categories
    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON cp_alerts
    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON financial_operations
    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON more_engagements_2025
    FOR ALL USING (auth.role() = 'authenticated');

-- Create or update drb_regions table
CREATE TABLE IF NOT EXISTS drb_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    wilaya_ids UUID[] REFERENCES wilayas(id)[],
    director_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create or update enterprises table
CREATE TABLE IF NOT EXISTS enterprises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    type enterprise_type NOT NULL,
    registration_number TEXT UNIQUE,
    tax_number TEXT UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    legal_representative_name TEXT,
    ministry_id UUID REFERENCES ministries(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create or update user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    type user_type NOT NULL,
    ministry_id UUID REFERENCES ministries(id),
    enterprise_id UUID REFERENCES enterprises(id),
    drb_region_id UUID REFERENCES drb_regions(id),
    wilaya_id UUID REFERENCES wilayas(id),
    is_active BOOLEAN DEFAULT true NOT NULL,
    signature_path TEXT,
    phone TEXT,
    office_address TEXT,
    position_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create or update delegations table
CREATE TABLE IF NOT EXISTS delegations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegator_id UUID REFERENCES auth.users(id) NOT NULL,
    delegate_id UUID REFERENCES auth.users(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    permissions TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT valid_delegation_period CHECK (end_date >= start_date)
);

-- Create or update signatures table
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type TEXT NOT NULL,
    document_id UUID NOT NULL,
    signer_id UUID REFERENCES auth.users(id) NOT NULL,
    signature_date TIMESTAMPTZ NOT NULL,
    signature_type TEXT NOT NULL,
    status TEXT NOT NULL,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create or update access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_ministry_id ON user_profiles(ministry_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(type);
CREATE INDEX IF NOT EXISTS idx_enterprises_ministry_id ON enterprises(ministry_id);
CREATE INDEX IF NOT EXISTS idx_delegations_delegator ON delegations(delegator_id);
CREATE INDEX IF NOT EXISTS idx_delegations_delegate ON delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_signatures_document ON signatures(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);

-- Enable Row Level Security
ALTER TABLE drb_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON drb_regions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON enterprises
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users" ON delegations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON signatures
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON access_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_drb_regions
    BEFORE UPDATE ON drb_regions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_enterprises
    BEFORE UPDATE ON enterprises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_user_profiles
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_delegations
    BEFORE UPDATE ON delegations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default enterprises
INSERT INTO enterprises (name, code, type, registration_number, tax_number)
VALUES 
    ('Direction Générale du Budget', 'DGB', 'public', 'DGB-001', 'TAX-DGB-001'),
    ('Direction Générale de la Comptabilité', 'DGC', 'public', 'DGC-001', 'TAX-DGC-001'),
    ('Direction Générale du Trésor', 'DGT', 'public', 'DGT-001', 'TAX-DGT-001')
ON CONFLICT (code) DO NOTHING;

-- Insert some DRB regions
INSERT INTO drb_regions (name, code)
VALUES 
    ('DRB Alger', 'DRB-16'),
    ('DRB Oran', 'DRB-31'),
    ('DRB Constantine', 'DRB-25'),
    ('DRB Ouargla', 'DRB-30'),
    ('DRB Bechar', 'DRB-08')
ON CONFLICT (code) DO NOTHING;
