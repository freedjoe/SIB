import { useEffect, useState, useCallback } from "react";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FolderPlus, FileEdit, Trash2, Eye, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase"; // Import Supabase client

// --- Interfaces ---
interface FiscalYearData {
  id: string;
  year: number;
  allocatedAE: number;
  allocatedCP: number;
  consumedAE: number;
  consumedCP: number;
  progress: number; // Calculated
  actions?: Action[]; // Add actions related to this program for this year
}

interface Program {
  id: string;
  code: string;
  name: string;
  description: string;
  portfolioId: string;
  parentId?: string | null; // Optional parent program ID
  type: "program" | "subprogram" | "dotation";
  status: "active" | "archived" | "planned" | "draft";
  fiscalYears: FiscalYearData[];
  // Removed top-level amount/progress fields, moved to fiscalYears
}

interface Portfolio {
  id: string;
  code: string; // Added code for portfolio
  name: string;
  description: string;
  totalAmount: number; // Keep this for overall portfolio value if needed elsewhere
  usedAmount: number; // Keep this for overall portfolio value if needed elsewhere
  programs: number; // Count of programs
  ministryId: string;
  ministryName: string;
  status: "active" | "archived" | "draft"; // Added status for portfolio (used in dropdown)
  fiscalYears: {
    id: string;
    year: number;
    allocatedAE: number;
    allocatedCP: number;
    consumedAE: number;
    consumedCP: number;
  }[]; // Added fiscal year data for portfolios
}

// Added interfaces for Actions and Operations (simplified for now)
interface Action {
  id: string;
  programId: string;
  fiscalYearId: string;
  code: string;
  name: string;
  allocatedAE: number;
  allocatedCP: number;
  consumedAE: number;
  consumedCP: number;
  operations?: Operation[]; // Optional: link operations to actions
}

interface Operation {
  id: string;
  actionId: string;
  code: string;
  title: string;
  allocatedAE: number;
  allocatedCP: number;
  consumedAE: number;
  consumedCP: number;
  physical_rate: number;
  financial_rate: number;
}

// Interface for Ministry data
interface Ministry {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// Interface for Fiscal Year data
interface FiscalYear {
  id: string;
  year: number;
  description?: string;
  status: "planning" | "active" | "closed" | "draft";
}

// --- Mock Data ---
const mockPortfolios: Portfolio[] = [
  {
    id: "port1",
    code: "PE-001",
    name: "Portfolio Éducation",
    description: "Regroupe tous les programmes éducatifs",
    totalAmount: 870000000,
    usedAmount: 525000000,
    programs: 2,
    ministryId: "m1",
    ministryName: "Ministère de l'Éducation",
    status: "active",
    fiscalYears: [
      { id: "fy1", year: 2024, allocatedAE: 870000000, allocatedCP: 750000000, consumedAE: 525000000, consumedCP: 480000000 },
      { id: "fy2", year: 2023, allocatedAE: 820000000, allocatedCP: 720000000, consumedAE: 820000000, consumedCP: 720000000 },
    ],
  },
  {
    id: "port2",
    code: "PS-002",
    name: "Portfolio Santé",
    description: "Programmes de santé publique et prévention",
    totalAmount: 730000000,
    usedAmount: 540000000,
    programs: 2,
    ministryId: "m2",
    ministryName: "Ministère de la Santé",
    status: "active",
    fiscalYears: [
      { id: "fy1", year: 2024, allocatedAE: 730000000, allocatedCP: 650000000, consumedAE: 540000000, consumedCP: 490000000 },
      { id: "fy2", year: 2023, allocatedAE: 680000000, allocatedCP: 610000000, consumedAE: 680000000, consumedCP: 610000000 },
    ],
  },
  {
    id: "port3",
    code: "PI-003",
    name: "Portfolio Infrastructure",
    description: "Développement des infrastructures de transport",
    totalAmount: 710000000,
    usedAmount: 210000000,
    programs: 2,
    ministryId: "m3",
    ministryName: "Ministère des Transports",
    status: "active",
    fiscalYears: [
      { id: "fy1", year: 2024, allocatedAE: 710000000, allocatedCP: 630000000, consumedAE: 210000000, consumedCP: 180000000 },
      { id: "fy2", year: 2023, allocatedAE: 650000000, allocatedCP: 590000000, consumedAE: 650000000, consumedCP: 590000000 },
    ],
  },
  // Add more mock portfolios if needed
];

const mockActions: Action[] = [
  {
    id: "act1",
    programId: "prog1",
    fiscalYearId: "fy1",
    code: "A1.1",
    name: "Action Formation Enseignants",
    allocatedAE: 50000000,
    allocatedCP: 40000000,
    consumedAE: 30000000,
    consumedCP: 25000000,
  },
  {
    id: "act2",
    programId: "prog1",
    fiscalYearId: "fy1",
    code: "A1.2",
    name: "Action Manuels Scolaires",
    allocatedAE: 30000000,
    allocatedCP: 28000000,
    consumedAE: 20000000,
    consumedCP: 18000000,
  },
  {
    id: "act3",
    programId: "prog6",
    fiscalYearId: "fy1",
    code: "A6.1",
    name: "Action Achat Tablettes",
    allocatedAE: 80000000,
    allocatedCP: 70000000,
    consumedAE: 40000000,
    consumedCP: 35000000,
  },
  {
    id: "act4",
    programId: "prog2",
    fiscalYearId: "fy1",
    code: "A2.1",
    name: "Action Construction Hôpital",
    allocatedAE: 200000000,
    allocatedCP: 150000000,
    consumedAE: 100000000,
    consumedCP: 80000000,
  },
];

const mockPrograms: Program[] = [
  {
    id: "prog1",
    code: "P101",
    name: "Programme d'Éducation Nationale",
    description: "Amélioration de la qualité de l'éducation à tous les niveaux.",
    portfolioId: "port1",
    parentId: null,
    type: "program",
    status: "active",
    fiscalYears: [
      {
        id: "fy1",
        year: 2024,
        allocatedAE: 750000000,
        allocatedCP: 650000000,
        consumedAE: 480000000,
        consumedCP: 400000000,
        progress: Math.round((480000000 / 750000000) * 100),
        actions: mockActions.filter((a) => a.programId === "prog1" && a.fiscalYearId === "fy1"),
      },
      {
        id: "fy2",
        year: 2023,
        allocatedAE: 700000000,
        allocatedCP: 620000000,
        consumedAE: 700000000,
        consumedCP: 620000000,
        progress: 100,
      },
    ],
  },
  {
    id: "prog2",
    code: "P201",
    name: "Santé Publique",
    description: "Renforcement du système de santé.",
    portfolioId: "port2",
    parentId: null,
    type: "program",
    status: "active",
    fiscalYears: [
      {
        id: "fy1",
        year: 2024,
        allocatedAE: 580000000,
        allocatedCP: 500000000,
        consumedAE: 390000000,
        consumedCP: 320000000,
        progress: Math.round((390000000 / 580000000) * 100),
        actions: mockActions.filter((a) => a.programId === "prog2" && a.fiscalYearId === "fy1"),
      },
      {
        id: "fy2",
        year: 2023,
        allocatedAE: 550000000,
        allocatedCP: 480000000,
        consumedAE: 550000000,
        consumedCP: 480000000,
        progress: 100,
      },
    ],
  },
  {
    id: "prog3",
    code: "P301",
    name: "Infrastructure Routière",
    description: "Construction et entretien du réseau routier.",
    portfolioId: "port3",
    parentId: null,
    type: "program",
    status: "active",
    fiscalYears: [
      {
        id: "fy1",
        year: 2024,
        allocatedAE: 430000000,
        allocatedCP: 380000000,
        consumedAE: 210000000,
        consumedCP: 180000000,
        progress: Math.round((210000000 / 430000000) * 100),
      },
      {
        id: "fy2",
        year: 2023,
        allocatedAE: 400000000,
        allocatedCP: 350000000,
        consumedAE: 400000000,
        consumedCP: 350000000,
        progress: 100,
      },
    ],
  },
  {
    id: "prog6",
    code: "SP101.1",
    name: "Numérisation des Écoles",
    description: "Équipement informatique.",
    portfolioId: "port1",
    parentId: "prog1", // Child of Programme d'Éducation Nationale
    type: "subprogram",
    status: "active",
    fiscalYears: [
      {
        id: "fy1",
        year: 2024,
        allocatedAE: 120000000,
        allocatedCP: 100000000,
        consumedAE: 45000000,
        consumedCP: 35000000,
        progress: Math.round((45000000 / 120000000) * 100),
        actions: mockActions.filter((a) => a.programId === "prog6" && a.fiscalYearId === "fy1"),
      },
      {
        id: "fy2",
        year: 2023,
        allocatedAE: 100000000,
        allocatedCP: 90000000,
        consumedAE: 100000000,
        consumedCP: 90000000,
        progress: 100,
      },
    ],
  },
  {
    id: "prog7",
    code: "P302",
    name: "Pont Intercommunal",
    description: "Nouveau pont.",
    portfolioId: "port3",
    parentId: null,
    type: "program",
    status: "planned",
    fiscalYears: [
      { id: "fy1", year: 2024, allocatedAE: 280000000, allocatedCP: 250000000, consumedAE: 0, consumedCP: 0, progress: 0 },
      { id: "fy2", year: 2023, allocatedAE: 0, allocatedCP: 0, consumedAE: 0, consumedCP: 0, progress: 0 }, // Assume planned in 2024
    ],
  },
  {
    id: "prog8",
    code: "D201.1",
    name: "Dotation Vaccination",
    description: "Campagne nationale.",
    portfolioId: "port2",
    parentId: "prog2",
    type: "dotation",
    status: "archived", // Changed status to archived (was completed)
    fiscalYears: [
      {
        id: "fy1",
        year: 2024,
        allocatedAE: 150000000,
        allocatedCP: 150000000,
        consumedAE: 150000000,
        consumedCP: 150000000,
        progress: 100,
      },
      { id: "fy2", year: 2023, allocatedAE: 130000000, allocatedCP: 130000000, consumedAE: 130000000, consumedCP: 130000000, progress: 100 },
    ],
  },
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Type for the data passed to the Add/Edit dialog
interface ProgramFormData {
  code?: string;
  name?: string;
  description?: string;
  portfolioId?: string;
  parentId?: string | null;
  type?: "program" | "subprogram" | "dotation";
  status?: "active" | "archived" | "planned" | "draft";
  // Fiscal year data might be handled separately or in a sub-form
  allocatedAE?: number; // Simplified: assuming for default/current fiscal year
  allocatedCP?: number; // Simplified: assuming for default/current fiscal year
}

export default function ProgramsPage() {
  // State for data
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios); // Keep portfolios for dropdowns
  const [ministries, setMinistries] = useState<Ministry[]>([]); // Add ministries state
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]); // Add fiscal years state
  const [currentFiscalYear, setCurrentFiscalYear] = useState<string>(""); // Current fiscal year ID

  // State for filters
  const [programNameFilter, setProgramNameFilter] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [portfolioFilter, setPortfolioFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Program["status"]>("active"); // Default to 'active'
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedPrograms, setPaginatedPrograms] = useState<Program[]>([]);

  // State for fiscal year selection (per card and in view dialog)
  const [programFiscalYears, setProgramFiscalYears] = useState<{ [key: string]: string }>({}); // For individual cards { programId: fiscalYearId }
  const [selectedFiscalYearView, setSelectedFiscalYearView] = useState("fy1"); // For view dialog

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);

  // Split form data into individual state variables to improve input responsiveness
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPortfolioId, setFormPortfolioId] = useState("");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formType, setFormType] = useState<Program["type"] | undefined>(undefined);
  const [formStatus, setFormStatus] = useState<Program["status"] | undefined>(undefined);
  const [formAllocatedAE, setFormAllocatedAE] = useState<number | undefined>(undefined);
  const [formAllocatedCP, setFormAllocatedCP] = useState<number | undefined>(undefined);
  const [formFiscalYear, setFormFiscalYear] = useState("");

  const [loading, setLoading] = useState(false); // Add this if not already present

  // --- Effects ---

  // Fetch programs and portfolios from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch fiscal years
        const { data: fiscalYearsData, error: fiscalYearsError } = await supabase
          .from("fiscal_years")
          .select("*")
          .order("year", { ascending: false });

        if (fiscalYearsError) throw fiscalYearsError;

        // Transform fiscal years data and find current year
        const currentYear = new Date().getFullYear();
        const transformedFiscalYears: FiscalYear[] = fiscalYearsData.map((fy) => ({
          id: fy.id,
          year: fy.year,
          label: `Année ${fy.year}`,
          isCurrent: fy.year === currentYear,
          startDate: fy.start_date,
          endDate: fy.end_date,
        }));

        setFiscalYears(transformedFiscalYears);

        // Set current fiscal year
        const currentFY = transformedFiscalYears.find((fy) => fy.year === currentYear);
        if (currentFY) {
          setCurrentFiscalYear(currentFY.id);
        } else if (transformedFiscalYears.length > 0) {
          // Default to the most recent if no current year is marked
          setCurrentFiscalYear(transformedFiscalYears[0].id);
        }

        // Fetch ministries data
        const { data: ministriesData, error: ministriesError } = await supabase.from("ministries").select("*").order("name_fr", { ascending: true });

        if (ministriesError) throw ministriesError;

        // Transform ministries data
        const transformedMinistries: Ministry[] = ministriesData.map((ministry) => ({
          id: ministry.id,
          name: ministry.name_fr || ministry.name_en || "",
          code: ministry.code || "",
          description: ministry.description,
        }));

        setMinistries(transformedMinistries);

        // Fetch portfolios
        const { data: portfoliosData, error: portfoliosError } = await supabase.from("portfolios").select("*");

        if (portfoliosError) throw portfoliosError;

        // Transform portfolios data
        const transformedPortfolios: Portfolio[] = portfoliosData.map((portfolio) => ({
          id: portfolio.id,
          code: portfolio.name.substring(0, 2).toUpperCase() + "-" + portfolio.id.substring(0, 3), // Generate a code from name if none exists
          name: portfolio.name,
          description: portfolio.description || "",
          totalAmount: 0, // This will be calculated after programs are fetched
          usedAmount: 0, // This will be calculated after programs are fetched
          programs: 0, // Count will be updated after programs are fetched
          ministryId: "", // Not available in current data model
          ministryName: "",
          status: "active", // Default status
          fiscalYears: [
            { id: "fy1", year: 2025, allocatedAE: 0, allocatedCP: 0, consumedAE: 0, consumedCP: 0 },
            { id: "fy2", year: 2024, allocatedAE: 0, allocatedCP: 0, consumedAE: 0, consumedCP: 0 },
          ],
        }));

        // Fetch programs
        const { data: programsData, error: programsError } = await supabase.from("programs").select("*");

        if (programsError) throw programsError;

        // Transform programs data
        const transformedPrograms: Program[] = programsData.map((program) => {
          const budget = program.budget || 0;
          const allocated = program.allocated || 0;
          // Calculate progress
          const progress = budget > 0 ? Math.round((allocated / budget) * 100) : 0;

          return {
            id: program.id,
            code: program.code_programme || `P${program.id.substring(0, 4)}`,
            name: program.name,
            description: program.description || "",
            portfolioId: program.portfolio_id,
            parentId: null, // Parent relationship not available in current schema
            type: "program", // Default type
            status: "active", // Default status
            fiscalYears: [
              {
                id: "fy1",
                year: program.fiscal_year || 2025,
                allocatedAE: budget,
                allocatedCP: budget * 0.8, // Assuming CP is 80% of AE for example
                consumedAE: allocated,
                consumedCP: allocated * 0.8, // Assuming CP consumption follows the same ratio
                progress: progress,
              },
              {
                id: "fy2",
                year: (program.fiscal_year || 2025) - 1,
                allocatedAE: 0,
                allocatedCP: 0,
                consumedAE: 0,
                consumedCP: 0,
                progress: 0,
              },
            ],
          };
        });

        // Update portfolio statistics based on programs
        const portfoliosWithStats = transformedPortfolios.map((portfolio) => {
          const portfolioPrograms = transformedPrograms.filter((p) => p.portfolioId === portfolio.id);
          const totalBudget = portfolioPrograms.reduce((sum, p) => sum + p.fiscalYears[0].allocatedAE, 0);
          const totalAllocated = portfolioPrograms.reduce((sum, p) => sum + p.fiscalYears[0].consumedAE, 0);

          // Update portfolio fiscal year data
          const updatedFiscalYears = portfolio.fiscalYears.map((fy) => {
            if (fy.id === "fy1") {
              return {
                ...fy,
                allocatedAE: totalBudget,
                allocatedCP: totalBudget * 0.8,
                consumedAE: totalAllocated,
                consumedCP: totalAllocated * 0.8,
              };
            }
            return fy;
          });

          return {
            ...portfolio,
            totalAmount: totalBudget,
            usedAmount: totalAllocated,
            programs: portfolioPrograms.length,
            fiscalYears: updatedFiscalYears,
          };
        });

        // Fetch actions to associate with programs
        const { data: actionsData, error: actionsError } = await supabase.from("actions").select("*");

        // If there are actions, associate them with programs
        if (actionsData && !actionsError) {
          const actionsMap = actionsData.reduce((acc, action) => {
            if (!acc[action.program_id]) {
              acc[action.program_id] = [];
            }

            // Transform action data
            const transformedAction: Action = {
              id: action.id,
              programId: action.program_id,
              fiscalYearId: "fy1", // Assuming current fiscal year
              code: action.code_action || `A-${action.id.substring(0, 4)}`,
              name: action.name,
              allocatedAE: 0, // Not available in current schema
              allocatedCP: 0, // Not available in current schema
              consumedAE: 0, // Not available in current schema
              consumedCP: 0, // Not available in current schema
            };

            acc[action.program_id].push(transformedAction);
            return acc;
          }, {});

          // Update programs with their actions
          const programsWithActions = transformedPrograms.map((program) => {
            const programActions = actionsMap[program.id] || [];
            const updatedFiscalYears = program.fiscalYears.map((fy) => {
              if (fy.id === "fy1") {
                return {
                  ...fy,
                  actions: programActions,
                };
              }
              return fy;
            });

            return {
              ...program,
              fiscalYears: updatedFiscalYears,
            };
          });

          setPrograms(programsWithActions);
        } else {
          setPrograms(transformedPrograms);
        }

        setPortfolios(portfoliosWithStats);
        setFilteredPrograms(transformedPrograms);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Initialize default fiscal year for each program card
  useEffect(() => {
    const now = new Date().getFullYear();
    const currentFiscalYear = fiscalYears.find((fy) => fy.year === now);
    const defaultFiscalYearId = currentFiscalYear ? currentFiscalYear.id : fiscalYears[0]?.id || "";
    const defaultPrograms: { [key: string]: string } = {};
    programs.forEach((program) => {
      defaultPrograms[program.id] = defaultFiscalYearId;
    });
    setProgramFiscalYears(defaultPrograms);
  }, [fiscalYears]); // Run when programs change

  // Add debounce effect for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgramNameFilter(searchInputValue);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // Filter programs based on all filters
  useEffect(() => {
    let result = programs;

    // Name/Code filter
    if (programNameFilter) {
      result = result.filter(
        (program) =>
          program.name.toLowerCase().includes(programNameFilter.toLowerCase()) || program.code.toLowerCase().includes(programNameFilter.toLowerCase())
      );
    }

    // Portfolio filter
    if (portfolioFilter && portfolioFilter !== "all") {
      result = result.filter((program) => program.portfolioId === portfolioFilter);
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((program) => program.status === statusFilter);
    }

    setFilteredPrograms(result);
  }, [programNameFilter, portfolioFilter, statusFilter, programs]);

  // Paginate programs
  useEffect(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedPrograms(filteredPrograms.slice(start, end));
  }, [filteredPrograms, currentPage, itemsPerPage]);

  // --- Helper Functions ---

  const getProgramFiscalYear = (programId: string) => {
    //return programFiscalYears[programId] || (programs.find((p) => p.id === programId)?.fiscalYears[0]?.id ?? "");
    // Find the fiscal year object for the current year
    const now = new Date().getFullYear();
    const currentFiscalYear = fiscalYears.find((fy) => fy.year === now);
    const defaultFiscalYearId = currentFiscalYear ? currentFiscalYear.id : fiscalYears[0]?.id || ""; // fallback to first or empty
    return programFiscalYears[programId] || defaultFiscalYearId;
  };

  const setProgramFiscalYear = (programId: string, fiscalYearId: string) => {
    setProgramFiscalYears((prev) => ({
      ...prev,
      [programId]: fiscalYearId,
    }));
  };

  const getStatusBadge = (status: Program["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400 whitespace-nowrap">
            Actif
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400 whitespace-nowrap">
            Archivé
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400 whitespace-nowrap">
            Planifié
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400 whitespace-nowrap"
          >
            Brouillon
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPortfolioName = (portfolioId: string) => {
    return portfolios.find((p) => p.id === portfolioId)?.name || "N/A";
  };

  const getParentProgramName = (parentId?: string | null) => {
    if (!parentId) return null;
    return programs.find((p) => p.id === parentId)?.name || "N/A";
  };

  const getProgramTypeLabel = (type: Program["type"]) => {
    switch (type) {
      case "program":
        return "Programme";
      case "subprogram":
        return "Sous-Programme";
      case "dotation":
        return "Dotation";
      default:
        return type;
    }
  };

  // --- Modal Handlers ---

  const handleOpenAddDialog = () => {
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormPortfolioId("");
    setFormParentId(null);
    setFormType(undefined);
    setFormStatus(undefined);
    setFormAllocatedAE(undefined);
    setFormAllocatedCP(undefined);
    setFormFiscalYear("");

    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (program: Program) => {
    setCurrentProgram(program);
    // Find the data for the default fiscal year (e.g., 2024 or first available)
    const defaultFyId = getProgramFiscalYear(program.id);
    const fiscalYearData = program.fiscalYears.find((fy) => fy.id === defaultFyId);

    setFormCode(program.code);
    setFormName(program.name);
    setFormDescription(program.description);
    setFormPortfolioId(program.portfolioId);
    setFormParentId(program.parentId);
    setFormType(program.type);
    setFormStatus(program.status);
    setFormAllocatedAE(fiscalYearData?.allocatedAE || 0); // Use data from specific year for edit form (simplification)
    setFormAllocatedCP(fiscalYearData?.allocatedCP || 0); // Use data from specific year for edit form (simplification)

    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (program: Program) => {
    setCurrentProgram(program);
    // Reset view dialog fiscal year to the default for the selected program
    const defaultFyId = getProgramFiscalYear(program.id);
    setSelectedFiscalYearView(defaultFyId || "fy1"); // Ensure a default if none found
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (program: Program) => {
    setCurrentProgram(program);
    setIsDeleteDialogOpen(true);
  };

  // --- CRUD Operations ---

  const handleAddProgram = async () => {
    if (!formName || !formCode || !formPortfolioId || !formType || !formStatus) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (Nom, Code, Portefeuille, Type, Statut).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create the program in Supabase
      const { data, error } = await supabase
        .from("programs")
        .insert({
          name: formName,
          code_programme: formCode,
          description: formDescription || "",
          portfolio_id: formPortfolioId,
          budget: formAllocatedAE || 0,
          allocated: 0, // Initially no allocation
          fiscal_year: new Date().getFullYear(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create a new program object for the local state
      const newProgram: Program = {
        id: data.id,
        code: data.code_programme || `P${data.id.substring(0, 4)}`,
        name: data.name,
        description: data.description || "",
        portfolioId: data.portfolio_id,
        parentId: formParentId || null,
        type: formType!,
        status: formStatus!,
        fiscalYears: [
          // Add default fiscal year structure
          {
            id: "fy1",
            year: new Date().getFullYear(),
            allocatedAE: formAllocatedAE || 0,
            allocatedCP: formAllocatedCP || 0,
            consumedAE: 0,
            consumedCP: 0,
            progress: 0,
          },
          {
            id: "fy2",
            year: new Date().getFullYear() - 1,
            allocatedAE: 0,
            allocatedCP: 0,
            consumedAE: 0,
            consumedCP: 0,
            progress: 0,
          },
        ],
      };

      setPrograms([...programs, newProgram]);
      // Add default fiscal year selection for the new program
      setProgramFiscalYears((prev) => ({ ...prev, [newProgram.id]: "fy1" }));
      setIsAddDialogOpen(false);
      toast({
        title: "Programme ajouté",
        description: `Le programme "${newProgram.name}" a été ajouté avec succès.`,
      });
    } catch (error) {
      console.error("Error adding program:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du programme. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = async () => {
    if (!currentProgram || !formName || !formCode || !formPortfolioId || !formType || !formStatus) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (Nom, Code, Portefeuille, Type, Statut).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update the program in Supabase
      const { error } = await supabase
        .from("programs")
        .update({
          name: formName,
          code_programme: formCode,
          description: formDescription || null,
          portfolio_id: formPortfolioId,
          budget: formAllocatedAE || 0,
        })
        .eq("id", currentProgram.id);

      if (error) throw error;

      // Update local state
      const updatedPrograms = programs.map((program) => {
        if (program.id === currentProgram.id) {
          // Update core data
          const updatedProgram = {
            ...program,
            code: formCode!,
            name: formName!,
            description: formDescription || program.description,
            portfolioId: formPortfolioId!,
            parentId: formParentId === "" ? null : formParentId || program.parentId,
            type: formType!,
            status: formStatus!,
          };

          // Update fiscal year data
          const currentFyId = getProgramFiscalYear(program.id);
          updatedProgram.fiscalYears = program.fiscalYears.map((fy) => {
            if (fy.id === currentFyId) {
              const newAllocatedAE = formAllocatedAE ?? fy.allocatedAE;
              const newConsumedAE = fy.consumedAE;
              return {
                ...fy,
                allocatedAE: newAllocatedAE,
                allocatedCP: formAllocatedCP ?? fy.allocatedCP,
                progress: newAllocatedAE > 0 ? Math.round((newConsumedAE / newAllocatedAE) * 100) : 0,
              };
            }
            return fy;
          });

          return updatedProgram;
        }
        return program;
      });

      setPrograms(updatedPrograms);
      setIsEditDialogOpen(false);
      toast({
        title: "Programme modifié",
        description: `Le programme "${currentProgram.name}" a été modifié avec succès.`,
      });
    } catch (error) {
      console.error("Error updating program:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du programme. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (!currentProgram) return;

    setLoading(true);
    try {
      // Delete the program from Supabase
      const { error } = await supabase.from("programs").delete().eq("id", currentProgram.id);

      if (error) throw error;

      // Update local state
      const updatedPrograms = programs.filter((program) => program.id !== currentProgram.id);
      setPrograms(updatedPrograms);

      // Clean up fiscal year state
      setProgramFiscalYears((prev) => {
        const newState = { ...prev };
        delete newState[currentProgram.id];
        return newState;
      });

      setIsDeleteDialogOpen(false);
      toast({
        title: "Programme supprimé",
        description: `Le programme "${currentProgram.name}" a été supprimé avec succès.`,
      });
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du programme. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter programs for the parent dropdown (exclude the current program being edited)
  const availableParentPrograms = programs.filter((p) => p.id !== currentProgram?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des programmes...</span>
      </div>
    );
  }

  return (
    <Dashboard>
      {/* Updated Header */}
      <DashboardHeader title="Liste des Programmes" description="Gérez les programmes, sous-programmes et dotations.">
        <Button onClick={handleOpenAddDialog} className="ml-auto">
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau Programme/Dotation
        </Button>
      </DashboardHeader>

      {/* Filter Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtrer les éléments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Name Filter */}
            <div>
              <Label htmlFor="program-name-filter" className="mb-2 block">
                Recherche (Nom/Code)
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="program-name-filter"
                  placeholder="Rechercher par nom ou code..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            {/* Portfolio Filter */}
            <div>
              <Label htmlFor="program-portfolio-filter" className="mb-2 block">
                Portefeuille
              </Label>
              <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                <SelectTrigger id="program-portfolio-filter" className="w-full">
                  <SelectValue placeholder="Sélectionner un portefeuille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les portefeuilles</SelectItem>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name} ({portfolio.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Status Filter */}
            <div>
              <Label htmlFor="program-status-filter" className="mb-2 block">
                Statut
              </Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger id="program-status-filter" className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DashboardSection>
        {/* Removed Tabs wrapper */}
        <DashboardGrid columns={2}>
          {paginatedPrograms.map((program) => {
            const selectedFyId = getProgramFiscalYear(program.id);
            const fiscalYearData = program.fiscalYears.find((fy) => fy.id === selectedFyId);
            const allocatedAE = fiscalYearData?.allocatedAE || 0;
            const consumedAE = fiscalYearData?.consumedAE || 0;
            const progress = fiscalYearData?.progress || 0; // Use progress from specific fiscal year
            const portfolioName = getPortfolioName(program.portfolioId);
            const parentName = getParentProgramName(program.parentId);

            return (
              <Card key={program.id} className="budget-card transition-all duration-300 hover:shadow-lg flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {" "}
                      {/* Ensure title/desc don't overflow */}
                      <CardTitle className="text-lg flex items-center gap-2 truncate">
                        <span className="truncate">{program.name}</span>
                        <span className="text-sm font-normal text-muted-foreground flex-shrink-0">({program.code})</span>
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{program.description}</CardDescription>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        <span>{getProgramTypeLabel(program.type)}</span>
                        {parentName && <span> / Parent: {parentName}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(program.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  {" "}
                  {/* Increased padding, flex-grow */}
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Progression ({fiscalYearData?.year || "N/A"})</span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            progress < 40 ? "text-red-600" : progress < 70 ? "text-yellow-600" : "text-green-600" // Consistent colors
                          )}
                        >
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* AE/CP Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Budget AE</p>
                        <p className="font-medium">{formatCurrency(allocatedAE)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">AE Consommé</p>
                        <p className="font-medium">{formatCurrency(consumedAE)}</p>
                      </div>
                    </div>

                    {/* Portfolio Info */}
                    <div className="grid grid-cols-1 gap-1">
                      {" "}
                      {/* Single column for portfolio */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Portefeuille</p>
                        <p className="font-medium truncate">{portfolioName}</p> {/* Added truncate */}
                      </div>
                      {/* Add other info like CP if needed */}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  {" "}
                  {/* Added border-t and padding */}
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(program)} title="Voir les détails">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(program)} title="Modifier">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(program)} title="Supprimer">
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                  {/* Fiscal Year Selector */}
                  <Select value={getProgramFiscalYear(program.id)} onValueChange={(value) => setProgramFiscalYear(program.id, value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Année fiscale" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiscalYears?.map((fiscalYear) => (
                        <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                          {"Année " + fiscalYear.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardFooter>
              </Card>
            );
          })}
          {filteredPrograms.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">Aucun programme ne correspond aux filtres sélectionnés.</div>
          )}
        </DashboardGrid>

        {/* Pagination Controls */}
        {filteredPrograms.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4 mt-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Affichage de {paginatedPrograms.length > 0 ? currentPage * itemsPerPage + 1 : 0} à{" "}
              {Math.min((currentPage + 1) * itemsPerPage, filteredPrograms.length)} sur {filteredPrograms.length} programmes
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              {/* Items per page */}
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Éléments par page</p>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(0); // Reset to first page when changing items per page
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={String(pageSize)}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Page info */}
              <div className="flex items-center text-sm font-medium">
                Page {currentPage + 1} sur {Math.max(1, Math.ceil(filteredPrograms.length / itemsPerPage))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  title="Première page"
                >
                  <span className="sr-only">Aller à la première page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m11 17-5-5 5-5"></path>
                    <path d="m18 17-5-5 5-5"></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage > 0 ? currentPage - 1 : 0)}
                  disabled={currentPage === 0}
                  title="Page précédente"
                >
                  <span className="sr-only">Aller à la page précédente</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const lastPage = Math.max(0, Math.ceil(filteredPrograms.length / itemsPerPage) - 1);
                    setCurrentPage(currentPage < lastPage ? currentPage + 1 : lastPage);
                  }}
                  disabled={currentPage >= Math.ceil(filteredPrograms.length / itemsPerPage) - 1}
                  title="Page suivante"
                >
                  <span className="sr-only">Aller à la page suivante</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const lastPage = Math.max(0, Math.ceil(filteredPrograms.length / itemsPerPage) - 1);
                    setCurrentPage(lastPage);
                  }}
                  disabled={currentPage >= Math.ceil(filteredPrograms.length / itemsPerPage) - 1}
                  title="Dernière page"
                >
                  <span className="sr-only">Aller à la dernière page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m13 17 5-5-5-5"></path>
                    <path d="m6 17 5-5-5-5"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* --- Dialogs --- */}

      {/* Add/Edit Program Dialog (Combined logic slightly, controlled by isEditDialogOpen) */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isEditDialogOpen ? setIsEditDialogOpen : setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          {" "}
          {/* Slightly wider */}
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Modifier" : "Ajouter"} un Programme/Sous-Programme/Dotation</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Modifiez les détails ci-dessous." : "Complétez le formulaire pour créer un nouvel élément."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 px-2">
            {" "}
            {/* Added scroll */}
            {/* Code */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-code" className="text-right">
                Code*
              </Label>
              <Input id="program-code" className="col-span-3" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
            </div>
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-name" className="text-right">
                Nom*
              </Label>
              <Input id="program-name" className="col-span-3" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            {/* Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-type" className="text-right">
                Type*
              </Label>
              <Select value={formType} onValueChange={(value: Program["type"]) => setFormType(value)}>
                <SelectTrigger id="program-type" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="program">Programme</SelectItem>
                  <SelectItem value="subprogram">Sous-Programme</SelectItem>
                  <SelectItem value="dotation">Dotation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Portfolio */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-portfolio" className="text-right">
                Portefeuille*
              </Label>
              <Select value={formPortfolioId} onValueChange={(value) => setFormPortfolioId(value)}>
                <SelectTrigger id="program-portfolio" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un portefeuille" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name} ({portfolio.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Parent Program (Optional) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-parent" className="text-right">
                Parent
              </Label>
              <Select
                value={formParentId || ""} // Use empty string for 'None'
                onValueChange={(value) => setFormParentId(value || null)} // Set null if empty
              >
                <SelectTrigger id="program-parent" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un parent (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {/* Filter out the program being edited if applicable */}
                  {availableParentPrograms
                    .filter((p) => p.type === "program" || p.type === "subprogram") // Only allow program/subprogram as parent
                    .map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name} ({program.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-status" className="text-right">
                Statut*
              </Label>
              <Select value={formStatus} onValueChange={(value: Program["status"]) => setFormStatus(value)}>
                <SelectTrigger id="program-status" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                  {/* Removed 'completed' as it's often derived */}
                </SelectContent>
              </Select>
            </div>
            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              {" "}
              {/* Changed to items-start */}
              <Label htmlFor="program-description" className="text-right pt-2">
                {" "}
                {/* Added padding */}
                Description
              </Label>
              <Textarea
                id="program-description"
                className="col-span-3"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            {/* Simplified AE/CP for current/default year - could be expanded */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-ae" className="text-right">
                Budget AE (Année)
              </Label>
              <Input
                id="program-ae"
                type="number"
                className="col-span-3"
                value={formAllocatedAE ?? ""}
                onChange={(e) => setFormAllocatedAE(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                placeholder="Ex: 1000000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-cp" className="text-right">
                Budget CP (Année)
              </Label>
              <Input
                id="program-cp"
                type="number"
                className="col-span-3"
                value={formAllocatedCP ?? ""}
                onChange={(e) => setFormAllocatedCP(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                placeholder="Ex: 900000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (isEditDialogOpen ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false))}>
              Annuler
            </Button>
            <Button onClick={isEditDialogOpen ? handleEditProgram : handleAddProgram}>{isEditDialogOpen ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Program Dialog (Inspired by Portfolio View) */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {" "}
          {/* Larger dialog */}
          {currentProgram ? (
            <ProgramDetailView
              program={currentProgram}
              portfolios={portfolios}
              programs={programs}
              selectedFiscalYearView={selectedFiscalYearView}
              setSelectedFiscalYearView={setSelectedFiscalYearView}
              mockActions={mockActions}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
              onClose={() => setIsViewDialogOpen(false)}
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground">Chargement des détails...</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Program Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ({currentProgram?.type}) ? Cette action est irréversible et supprimera les données
              associées.
            </DialogDescription>
          </DialogHeader>
          {currentProgram && (
            <div className="py-4">
              <p>
                <strong>Code:</strong> {currentProgram.code}
              </p>
              <p>
                <strong>Nom:</strong> {currentProgram.name}
              </p>
              <p>
                <strong>Portefeuille:</strong> {getPortfolioName(currentProgram.portfolioId)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProgram}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}

// Separate component for program details view
function ProgramDetailView({
  program,
  portfolios,
  programs,
  selectedFiscalYearView,
  setSelectedFiscalYearView,
  mockActions,
  formatCurrency,
  getStatusBadge,
  onClose,
}) {
  const portfolio = portfolios.find((p) => p.id === program.portfolioId);
  const parentProgram = programs.find((p) => p.id === program.parentId);
  const fiscalYearData = program.fiscalYears.find((fy) => fy.id === selectedFiscalYearView);
  const allocatedAE = fiscalYearData?.allocatedAE || 0;
  const allocatedCP = fiscalYearData?.allocatedCP || 0;
  const consumedAE = fiscalYearData?.consumedAE || 0;
  const consumedCP = fiscalYearData?.consumedCP || 0;
  const progressAE = allocatedAE > 0 ? Math.round((consumedAE / allocatedAE) * 100) : 0;
  const progressCP = allocatedCP > 0 ? Math.round((consumedCP / allocatedCP) * 100) : 0;
  const actionsForYear =
    fiscalYearData?.actions || mockActions.filter((a) => a.programId === program.id && a.fiscalYearId === selectedFiscalYearView);

  const getProgramTypeLabel = (type) => {
    switch (type) {
      case "program":
        return "Programme";
      case "subprogram":
        return "Sous-Programme";
      case "dotation":
        return "Dotation";
      default:
        return type;
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl flex items-center gap-2 flex-wrap">
              <span className="truncate">{program.name}</span>
              <span className="text-sm font-normal text-muted-foreground flex-shrink-0">({program.code})</span>
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              {getProgramTypeLabel(program.type)} {program.description && ` - ${program.description}`}
            </DialogDescription>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {portfolio && (
                <span>
                  Portefeuille: {portfolio.name} ({portfolio.code})
                </span>
              )}
              {parentProgram && (
                <span>
                  {" "}
                  / Parent: {parentProgram.name} ({parentProgram.code})
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">{getStatusBadge(program.status)}</div>
        </div>
      </DialogHeader>

      <div className="py-6 space-y-8">
        {/* Fiscal Year Selector */}
        <div className="flex justify-end">
          <Select value={selectedFiscalYearView} onValueChange={setSelectedFiscalYearView}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Année Fiscale" />
            </SelectTrigger>
            <SelectContent>
              {program.fiscalYears.map((fy) => (
                <SelectItem key={fy.id} value={fy.id}>
                  Année Fiscale {fy.year}
                </SelectItem>
              ))}
              {program.fiscalYears.length === 0 && (
                <SelectItem value="" disabled>
                  Aucune année
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AE Allouées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(allocatedAE)}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CP Alloués</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(allocatedCP)}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AE Consommées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(consumedAE)}</div>
              <div className="text-sm text-muted-foreground mt-1">{progressAE}% utilisés</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CP Consommés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(consumedCP)}</div>
              <div className="text-sm text-muted-foreground mt-1">{progressCP}% utilisés</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progression de la Consommation ({fiscalYearData?.year || "N/A"})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* AE Progress Circle */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 relative flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 dark:text-gray-700 stroke-current"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="10"
                      strokeDasharray={`${progressAE * 2.51} 251.2`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xl font-bold">{progressAE}%</div>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium">Consommation AE</p>
              </div>
              {/* CP Progress Circle */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 relative flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 dark:text-gray-700 stroke-current"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-secondary stroke-current"
                      strokeWidth="10"
                      strokeDasharray={`${progressCP * 2.51} 251.2`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xl font-bold">{progressCP}%</div>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium">Consommation CP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions Associées ({fiscalYearData?.year || "N/A"})</CardTitle>
            <CardDescription>Liste des actions liées pour l'année fiscale sélectionnée.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                    <th className="py-3 px-4 text-left font-medium">Code</th>
                    <th className="py-3 px-4 text-left font-medium">Nom Action</th>
                    <th className="py-3 px-4 text-right font-medium">AE Allouées</th>
                    <th className="py-3 px-4 text-right font-medium">CP Alloués</th>
                    <th className="py-3 px-4 text-right font-medium">AE Consommées</th>
                    <th className="py-3 px-4 text-right font-medium">CP Consommés</th>
                    <th className="py-3 px-4 text-center font-medium">Taux AE (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {actionsForYear.map((action) => {
                    const tauxAE = action.allocatedAE > 0 ? Math.round((action.consumedAE / action.allocatedAE) * 100) : 0;
                    return (
                      <tr key={action.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">{action.code}</td>
                        <td className="py-3 px-4">{action.name}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(action.allocatedAE)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(action.allocatedCP)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(action.consumedAE)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(action.consumedCP)}</td>
                        <td className="py-3 px-4 text-center">{tauxAE}%</td>
                      </tr>
                    );
                  })}
                  {actionsForYear.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted-foreground">
                        Aucune action associée pour cette année fiscale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for Operations or other charts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Autres Détails</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">[Autres graphiques ou tableaux à venir, ex: Liste des Opérations]</p>
          </CardContent>
        </Card>
      </div>
      <DialogFooter className="gap-2 pt-4 border-t">
        {/* Add Generate Report Button if needed */}
        <Button onClick={onClose}>Fermer</Button>
      </DialogFooter>
    </>
  );
}
