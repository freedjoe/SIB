-- Create prevision_cp table
CREATE TABLE prevision_cp (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  engagement_id UNIQUEIDENTIFIER NOT NULL,
  operation_id UNIQUEIDENTIFIER NOT NULL,
  exercice INT NOT NULL,
  periode VARCHAR(7) NOT NULL,
  montant_prevu DECIMAL(15,2) NOT NULL,
  montant_demande DECIMAL(15,2) NULL,
  montant_mobilise DECIMAL(15,2) NULL,
  montant_consomme DECIMAL(15,2) NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'prévu',
  date_soumission DATETIME NULL,
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_prevision_cp_engagement FOREIGN KEY (engagement_id) REFERENCES engagements(id),
  CONSTRAINT FK_prevision_cp_operation FOREIGN KEY (operation_id) REFERENCES operations(id),
  CONSTRAINT CK_prevision_cp_periode CHECK (periode LIKE '[0-9][0-9][0-9][0-9]-Q[1-4]'),
  CONSTRAINT CK_prevision_cp_exercice CHECK (exercice >= 2000 AND exercice <= 2100),
  CONSTRAINT CK_prevision_cp_periode_exercice CHECK (CAST(SUBSTRING(periode, 1, 4) AS INT) = exercice),
  CONSTRAINT UQ_prevision_cp_engagement_periode UNIQUE (engagement_id, periode)
);

-- Create indexes
CREATE INDEX IX_prevision_cp_engagement_id ON prevision_cp(engagement_id);
CREATE INDEX IX_prevision_cp_operation_id ON prevision_cp(operation_id);
CREATE INDEX IX_prevision_cp_exercice ON prevision_cp(exercice);
CREATE INDEX IX_prevision_cp_periode ON prevision_cp(periode);
CREATE INDEX IX_prevision_cp_statut ON prevision_cp(statut); 