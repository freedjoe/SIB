-- Create cp_previsions table (Prévisions CP)
CREATE TABLE cp_previsions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programme_id UUID NOT NULL REFERENCES programs(id),
    exercice INTEGER NOT NULL,
    periode TEXT NOT NULL, -- Format: '2024-Q1' or '2024-01'
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

-- Create cp_mobilisations table (Mobilisations CP)
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

-- Create cp_consommations table (Consommations CP)
CREATE TABLE cp_consommations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prevision_id UUID NOT NULL REFERENCES cp_previsions(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    montant_consomme DECIMAL(15,2) NOT NULL,
    date_consommation DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create cp_alertes table (Alertes CP)
CREATE TABLE cp_alertes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prevision_id UUID NOT NULL REFERENCES cp_previsions(id),
    type_alerte TEXT NOT NULL CHECK (type_alerte IN ('retard_mobilisation', 'insuffisance_montant', 'delai_depassement')),
    message TEXT NOT NULL,
    statut TEXT NOT NULL CHECK (statut IN ('active', 'resolue', 'ignoree')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- Create cp_historique table (Historique des modifications)
CREATE TABLE cp_historique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prevision_id UUID NOT NULL REFERENCES cp_previsions(id),
    action TEXT NOT NULL,
    ancienne_valeur JSONB,
    nouvelle_valeur JSONB,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_cp_previsions_programme ON cp_previsions(programme_id);
CREATE INDEX idx_cp_previsions_exercice ON cp_previsions(exercice);
CREATE INDEX idx_cp_previsions_statut ON cp_previsions(statut);
CREATE INDEX idx_cp_mobilisations_prevision ON cp_mobilisations(prevision_id);
CREATE INDEX idx_cp_consommations_prevision ON cp_consommations(prevision_id);
CREATE INDEX idx_cp_consommations_payment ON cp_consommations(payment_id);
CREATE INDEX idx_cp_alertes_prevision ON cp_alertes(prevision_id);
CREATE INDEX idx_cp_historique_prevision ON cp_historique(prevision_id); 