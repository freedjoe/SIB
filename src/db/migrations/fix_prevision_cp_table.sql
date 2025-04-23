-- Drop existing table if it exists
DROP TABLE IF EXISTS prevision_cp CASCADE;

-- Create prevision_cp table with PostgreSQL syntax
CREATE TABLE prevision_cp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL,
  operation_id UUID NOT NULL,
  exercice INTEGER NOT NULL,
  periode VARCHAR(7) NOT NULL,
  montant_prevu DECIMAL(15,2) NOT NULL,
  montant_demande DECIMAL(15,2),
  montant_mobilise DECIMAL(15,2),
  montant_consomme DECIMAL(15,2),
  statut VARCHAR(20) NOT NULL DEFAULT 'prévu',
  date_soumission TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prevision_cp_engagement FOREIGN KEY (engagement_id) REFERENCES engagements(id),
  CONSTRAINT fk_prevision_cp_operation FOREIGN KEY (operation_id) REFERENCES operations(id),
  CONSTRAINT ck_prevision_cp_periode CHECK (periode ~ '^[0-9]{4}-Q[1-4]$'),
  CONSTRAINT ck_prevision_cp_exercice CHECK (exercice >= 2000 AND exercice <= 2100),
  CONSTRAINT ck_prevision_cp_periode_exercice CHECK (CAST(SUBSTRING(periode, 1, 4) AS INTEGER) = exercice),
  CONSTRAINT uq_prevision_cp_engagement_periode UNIQUE (engagement_id, periode)
);

-- Create indexes
CREATE INDEX ix_prevision_cp_engagement_id ON prevision_cp(engagement_id);
CREATE INDEX ix_prevision_cp_operation_id ON prevision_cp(operation_id);
CREATE INDEX ix_prevision_cp_exercice ON prevision_cp(exercice);
CREATE INDEX ix_prevision_cp_periode ON prevision_cp(periode);
CREATE INDEX ix_prevision_cp_statut ON prevision_cp(statut);

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prevision_cp_updated_at
    BEFORE UPDATE ON prevision_cp
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 