import { Badge } from "@/components/ui/badge";
import { Operation } from "@/types/database.types";
import { advancedSearch } from "@/utils/search/searchUtils";

// Get status badge component
export const getStatusBadge = (status: string | null | undefined) => {
  switch (status?.toLowerCase()) {
    case "in_progress":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400">
          En cours
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
          Terminé
        </Badge>
      );
    case "planned":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400">
          Planifié
        </Badge>
      );
    case "en_pause":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400">
          En pause
        </Badge>
      );
    case "arreter":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400">
          Arrêté
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-400">
          Brouillon
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-400">
          Inconnu
        </Badge>
      );
  }
};

// Get progress bar color based on percentage
export const getProgressBarColor = (progress: number | undefined | null) => {
  if (!progress) return "bg-gray-600";
  if (progress < 25) return "bg-red-600";
  if (progress < 50) return "bg-orange-600";
  if (progress < 75) return "bg-yellow-600";
  return "bg-green-600";
};

// Get progress text color based on percentage
export const getProgressTextColor = (progress: number | undefined | null) => {
  if (!progress) return "text-gray-600";
  if (progress < 25) return "text-red-600";
  if (progress < 50) return "text-orange-600";
  if (progress < 75) return "text-yellow-600";
  return "text-green-600";
};

// Mock data for operation details
export const mockEngagementsHistory = [
  {
    id: "eng1",
    date: "2023-02-15",
    reference: "ENG-2023-001",
    montant_initial: 35000000,
    montant_actuel: 35000000,
    statut: "Approuvé",
    beneficiaire: "Enterprise de construction ABC",
  },
  {
    id: "eng2",
    date: "2023-04-20",
    reference: "ENG-2023-002",
    montant_initial: 25000000,
    montant_actuel: 30000000,
    statut: "Réévalué",
    beneficiaire: "Fournisseur XYZ",
  },
  {
    id: "eng3",
    date: "2023-06-10",
    reference: "ENG-2023-003",
    montant_initial: 15000000,
    montant_actuel: 15000000,
    statut: "En cours",
    beneficiaire: "Consultant DEF",
  },
];

export const mockReevaluations = [
  {
    id: "reev1",
    date: "2023-05-10",
    engagement_ref: "ENG-2023-002",
    montant_initial: 25000000,
    montant_reevalue: 30000000,
    motif: "Augmentation du périmètre des travaux",
    statut: "Approuvée",
  },
];

export const mockCPAnnuels = [
  {
    id: "cp1",
    annee: "2023",
    montant_alloue: 50000000,
    montant_consomme: 35000000,
    taux_consommation: 70,
    statut: "En cours",
  },
  {
    id: "cp2",
    annee: "2024",
    montant_alloue: 40000000,
    montant_consomme: 0,
    taux_consommation: 0,
    statut: "Planifié",
  },
];

export const mockDemandesCP = [
  {
    id: "dcp1",
    date: "2023-01-20",
    montant: 30000000,
    motif: "Démarrage des travaux",
    statut: "Approuvée",
  },
  {
    id: "dcp2",
    date: "2023-05-15",
    montant: 20000000,
    motif: "Phase intermédiaire",
    statut: "En attente",
  },
];

export const mockContrats = [
  {
    id: "cont1",
    reference: "CTR-2023-001",
    enterprise: "Enterprise de construction ABC",
    date_signature: "2023-02-01",
    montant: 35000000,
    objet: "Construction principale",
    statut: "En cours",
  },
  {
    id: "cont2",
    reference: "CTR-2023-002",
    enterprise: "Fournisseur XYZ",
    date_signature: "2023-04-05",
    montant: 25000000,
    objet: "Fourniture d'équipements",
    statut: "En cours",
  },
];

// Helper function to filter operations
export const filterOperations = (
  operations: Operation[],
  searchTerm: string,
  programFilter: string,
  wilayaFilter: string,
  statusFilter: string,
  titreBudgetaireFilter: string,
  origineFinancementFilter: string
) => {
  // First apply the advanced search with multi-word, case-insensitive, accent-insensitive search
  const searchFields = ["name", "code", "description", "wilaya.name", "wilaya.name_fr", "wilaya.name_ar"];
  let filteredBySearch = operations;

  // Only apply search if there's a search term
  if (searchTerm && searchTerm.trim() !== "") {
    filteredBySearch = advancedSearch(operations, searchTerm, searchFields, {
      matchAllWords: true, // Match any of the words in the search term
      normalizeText: true, // Handle accented characters (French, Arabic, etc.)
      wholeWordsOnly: false, // Match partial words too
    });
  }

  // Then apply the rest of the filters
  return filteredBySearch.filter((operation) => {
    // Program filter from nested action's program_id
    const matchesProgram = programFilter === "all" || operation.action?.program_id === programFilter;

    // Wilaya filter
    const matchesWilaya = wilayaFilter === "all" || operation.wilaya_id === wilayaFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || (operation.status || "").toLowerCase() === statusFilter.toLowerCase();

    // Titre budgétaire filter
    const matchesTitreBudgetaire =
      titreBudgetaireFilter === "all" || (operation.titre_budgetaire && operation.titre_budgetaire.toString() === titreBudgetaireFilter);

    // Origine financement filter
    const matchesOrigineFinancement =
      origineFinancementFilter === "all" || (operation.origine_financement || "").toLowerCase() === origineFinancementFilter.toLowerCase();

    // Return true if all filters match
    return matchesProgram && matchesWilaya && matchesStatus && matchesTitreBudgetaire && matchesOrigineFinancement;
  });
};
