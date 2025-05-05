import React, { useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { Wilaya, Program, BudgetTitle } from "@/types/database.types";

interface OperationsFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  programFilter: string;
  setProgramFilter: (value: string) => void;
  wilayaFilter: string;
  setWilayaFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  titreBudgetaireFilter: string;
  setTitreBudgetaireFilter: (value: string) => void;
  origineFinancementFilter: string;
  setOrigineFinancementFilter: (value: string) => void;
  programsData: Program[];
  wilayasData: Wilaya[];
  budgetTitlesData?: BudgetTitle[];
}

export const OperationsFilter: React.FC<OperationsFilterProps> = ({
  searchTerm,
  setSearchTerm,
  programFilter,
  setProgramFilter,
  wilayaFilter,
  setWilayaFilter,
  statusFilter,
  setStatusFilter,
  titreBudgetaireFilter,
  setTitreBudgetaireFilter,
  origineFinancementFilter,
  setOrigineFinancementFilter,
  programsData,
  wilayasData,
  budgetTitlesData = [],
}) => {
  // Debug: Log the wilayasData to see what we're getting
  useEffect(() => {
    console.log("OperationsFilter received wilayasData:", wilayasData);
  }, [wilayasData]);

  // Memoize option lists to prevent unnecessary re-renders
  const programOptions = useMemo(() => {
    return programsData?.length > 0
      ? programsData.map((program) => (
          <SelectItem key={program.id} value={program.id}>
            {program.code} - {program.name}
          </SelectItem>
        ))
      : [];
  }, [programsData]);

  const wilayaOptions = useMemo(() => {
    if (!wilayasData || wilayasData.length === 0) {
      console.log("No wilayas data available");
      return [];
    }

    // Check the structure of the first wilaya to help debug
    if (wilayasData.length > 0) {
      console.log("First wilaya object structure:", wilayasData[0]);
    }

    return wilayasData.map((wilaya) => (
      <SelectItem key={wilaya.id} value={wilaya.id}>
        {wilaya.code} - {wilaya.name_fr || "(Nom inconnu)"}
      </SelectItem>
    ));
  }, [wilayasData]);

  const budgetTitleOptions = useMemo(() => {
    return budgetTitlesData?.length > 0
      ? budgetTitlesData.map((title) => (
          <SelectItem key={title.id} value={title.id}>
            {title.code} - {title.name}
          </SelectItem>
        ))
      : [];
  }, [budgetTitlesData]);

  return (
    <Card className="budget-card mb-6">
      <CardHeader>
        <CardTitle className="text-base">Filtrer les opérations</CardTitle>
        <CardDescription>Recherchez et filtrez par programme ou statut</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une opération..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par programme" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Tous les programmes</SelectItem>
                {programOptions}
              </SelectContent>
            </Select>
            <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par wilaya" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Toutes les wilayas</SelectItem>
                {wilayaOptions}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="planned">Planifié</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="en_pause">En pause</SelectItem>
                <SelectItem value="arreter">Arrêté</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={titreBudgetaireFilter} onValueChange={setTitreBudgetaireFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par titre budgétaire" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Tous les titres</SelectItem>
                {budgetTitleOptions}
              </SelectContent>
            </Select>
            <Select value={origineFinancementFilter} onValueChange={setOrigineFinancementFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par origine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les origines</SelectItem>
                <SelectItem value="budget_national">Budget national</SelectItem>
                <SelectItem value="financement_exterieur">Financement extérieur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
