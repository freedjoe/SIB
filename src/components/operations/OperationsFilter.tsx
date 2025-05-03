import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { titresBudgetaires } from "./OperationsUtils";
import { Wilaya, Program } from "@/types/database.types";

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
}) => {
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
              <SelectContent>
                <SelectItem value="all">Tous les programmes</SelectItem>
                {programsData.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par wilaya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les wilayas</SelectItem>
                {wilayasData.map((wilaya) => (
                  <SelectItem key={wilaya.id} value={wilaya.id}>
                    {wilaya.name}
                  </SelectItem>
                ))}
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
              <SelectContent>
                <SelectItem value="all">Tous les titres</SelectItem>
                {titresBudgetaires.map((titre) => (
                  <SelectItem key={titre.id} value={titre.id.toString()}>
                    {titre.shortLabel} - {titre.name}
                  </SelectItem>
                ))}
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
