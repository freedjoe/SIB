import { PrevisionCP, Operation, Engagement } from "@/types/prevision_cp";
import { v4 as uuidv4 } from "uuid";

// Generate UUIDs for our entities
const operationIds = {
  op1: uuidv4(),
  op2: uuidv4(),
};

const engagementIds = {
  eng1: uuidv4(),
  eng2: uuidv4(),
};

const previsionIds = {
  prev1: uuidv4(),
  prev2: uuidv4(),
  prev3: uuidv4(),
  prev4: uuidv4(),
};

// Generate a UUID for the program
const programId = uuidv4();

export const mockOperations: Operation[] = [
  {
    id: "1",
    code: "OP2024-001",
    libelle: "Opération 1",
    description: "Description de l'opération 1",
    date_debut: "2024-01-01T00:00:00.000Z",
    date_fin: "2024-12-31T23:59:59.999Z",
    statut: "en_cours",
    budget_id: "budget_1",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    code: "OP2024-002",
    libelle: "Opération 2",
    description: "Description de l'opération 2",
    date_debut: "2024-01-01T00:00:00.000Z",
    date_fin: "2024-12-31T23:59:59.999Z",
    statut: "en_cours",
    budget_id: "budget_2",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

export const mockEngagements: Engagement[] = [
  {
    id: "1",
    code: "EJ2024-001",
    libelle: "Engagement 1",
    description: "Description de l'engagement 1",
    montant: 100000,
    date_engagement: "2024-01-15T00:00:00.000Z",
    statut: "validé",
    operation_id: "1",
    created_at: "2024-01-15T00:00:00.000Z",
    updated_at: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    code: "EJ2024-002",
    libelle: "Engagement 2",
    description: "Description de l'engagement 2",
    montant: 150000,
    date_engagement: "2024-02-01T00:00:00.000Z",
    statut: "validé",
    operation_id: "2",
    created_at: "2024-02-01T00:00:00.000Z",
    updated_at: "2024-02-01T00:00:00.000Z",
  },
];

export const mockPrevisionsCP: PrevisionCP[] = [
  {
    id: "1",
    exercice: "2024",
    periode: "2024-Q1",
    operation_id: "1",
    operation: mockOperations[0],
    engagement_id: "1",
    engagement: mockEngagements[0],
    montant_prevu: 25000,
    montant_demande: 25000,
    montant_mobilise: 25000,
    montant_consomme: 0,
    statut: "mobilisé",
    notes: "Notes pour la prévision 1",
    date_soumission: "2024-01-20T00:00:00.000Z",
    created_at: "2024-01-20T00:00:00.000Z",
    updated_at: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "2",
    exercice: "2024",
    periode: "2024-Q2",
    operation_id: "1",
    operation: mockOperations[0],
    engagement_id: "1",
    engagement: mockEngagements[0],
    montant_prevu: 25000,
    montant_demande: 25000,
    montant_mobilise: 0,
    montant_consomme: 0,
    statut: "demandé",
    notes: "Notes pour la prévision 2",
    date_soumission: "2024-02-01T00:00:00.000Z",
    created_at: "2024-02-01T00:00:00.000Z",
    updated_at: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "3",
    exercice: "2024",
    periode: "2024-Q3",
    operation_id: "2",
    operation: mockOperations[1],
    engagement_id: "2",
    engagement: mockEngagements[1],
    montant_prevu: 50000,
    montant_demande: 0,
    montant_mobilise: 0,
    montant_consomme: 0,
    statut: "prévu",
    notes: null,
    date_soumission: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    exercice: "2024",
    periode: "2024-Q4",
    operation_id: "2",
    operation: mockOperations[1],
    engagement_id: "2",
    engagement: mockEngagements[1],
    montant_prevu: 50000,
    montant_demande: 0,
    montant_mobilise: 0,
    montant_consomme: 0,
    statut: "prévu",
    notes: null,
    date_soumission: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];
