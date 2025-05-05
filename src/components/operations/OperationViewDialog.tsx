import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCog, FileText, ClipboardEdit, Map, PenTool, CalendarIcon, Upload } from "lucide-react";
import { Operation, Program } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { getStatusBadge, getProgressBarColor, mockCPAnnuels, mockDemandesCP, mockEngagementsHistory, mockContrats } from "./OperationsUtils";
import { useBudgetTitles } from "@/hooks/supabase";

interface OperationViewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  operation: Operation | null;
  programsData: Program[];
  onEdit: (operation: Operation) => void;
}

export const OperationViewDialog: React.FC<OperationViewDialogProps> = ({ isOpen, setIsOpen, operation, programsData, onEdit }) => {
  if (!operation) return null;

  // Fetch budget titles
  const { data: budgetTitles = [] } = useBudgetTitles();

  // Find the budget title data for this operation
  const budgetTitle = operation.budget_title_id
    ? budgetTitles.find((t) => t.id === operation.budget_title_id)
    : budgetTitles.find((t) => t.id === operation.titre_budgetaire);

  // Formattage pour les montants
  const formattedAllocated = formatCurrency(operation.allocated_ae || 0);
  const formattedConsumed = formatCurrency(operation.consumed_ae || 0);
  const formattedRemaining = formatCurrency((operation.allocated_ae || 0) - (operation.consumed_ae || 0));

  // Taux de consommation financier
  const consumptionRate =
    operation.allocated_ae && operation.allocated_ae > 0 ? (((operation.consumed_ae || 0) / operation.allocated_ae) * 100).toFixed(1) : "0";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between mt-3">
            <div className="flex-1 mr-4">
              <DialogTitle className="flex items-center gap-2">
                <FileCog className="h-6 w-6 flex-shrink-0" />
                <span className="break-words">{operation.name}</span>
              </DialogTitle>
            </div>
            <div className="flex-shrink-0">{getStatusBadge(operation.status)}</div>
          </div>
          <DialogDescription>{operation.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Informations principales en cartes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500">Code Opération</h3>
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-lg font-semibold break-words">{operation.code}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500">Portefeuille</h3>
                  <ClipboardEdit className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-lg font-semibold">
                  {operation.action?.program?.portfolio
                    ? `${operation.action.program.portfolio.code} - ${operation.action.program.portfolio.name}`
                    : "Non défini"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500">Wilaya</h3>
                  <Map className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-lg font-semibold truncate">{operation.wilaya?.name}</p>
              </CardContent>
            </Card>
          </div>

          {/* Indicateurs de progrès financier et physique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Progrès Financier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AE Allouées</span>
                      <span className="font-semibold">{formattedAllocated}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AE Consommées</span>
                      <span className="font-semibold">{formattedConsumed}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taux de Consommation</span>
                      <span className="font-semibold">{consumptionRate}%</span>
                    </div>
                  </div>

                  <Progress
                    value={parseFloat(consumptionRate)}
                    className="h-2"
                    indicatorClassName={getProgressBarColor(parseFloat(consumptionRate))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Progrès Physique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Action</span>
                      <span className="font-semibold">{operation.action?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taux d'avancement</span>
                      <span className="font-semibold">{operation.physical_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Date d'inscription</span>
                      <span className="font-semibold">
                        {operation.inscription_date ? new Date(operation.inscription_date).toLocaleDateString("fr-FR") : "Non définie"}
                      </span>
                    </div>
                  </div>

                  <Progress value={operation.physical_rate || 0} className="h-2" indicatorClassName={getProgressBarColor(operation.physical_rate)} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onglets détaillés */}
          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="financial">Données Financières</TabsTrigger>
              <TabsTrigger value="implementation">Mise en œuvre</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="observations">Observations</TabsTrigger>
            </TabsList>

            <div className="pt-4">
              {/* Onglet Détails */}
              <TabsContent value="details">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Détails de l'Opération</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => onEdit(operation)}>
                      <PenTool className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Date d'inscription</h3>
                          <p className="font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            {operation.inscription_date ? new Date(operation.inscription_date).toLocaleDateString("fr-FR") : "Non définie"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Programme</h3>
                          <p className="font-semibold">{programsData.find((p) => p.id === operation.action?.program_id)?.name || "Non défini"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Action</h3>
                          <p className="font-semibold">{operation.action?.name || "Non définie"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Wilaya</h3>
                          <p className="font-semibold">{operation.wilaya?.name || "Non définie"}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Titre budgétaire</h3>
                          <p className="font-semibold">
                            {budgetTitle ? `${budgetTitle.code} - ${budgetTitle.name}` : `T${operation.titre_budgetaire || "?"}`}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Origine du financement</h3>
                          <p className="font-semibold">
                            {operation.origine_financement === "budget_national" ? "Budget national" : "Financement extérieur"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Dates planifiées</h3>
                          <div>
                            <p>
                              <span className="font-medium">Début:</span> {operation.start_date || "Non définie"}
                            </p>
                            <p>
                              <span className="font-medium">Fin:</span> {operation.end_date || "Non définie"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Description</h3>
                          <p>{operation.description || "Aucune description disponible."}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Données Financières */}
              <TabsContent value="financial">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations Financières</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Autorisations d'Engagement (AE)</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b pb-1">
                              <span>AE Initiale</span>
                              <span className="font-semibold">{formattedAllocated}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>AE Consommée</span>
                              <span className="font-semibold">{formattedConsumed}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>AE Restante</span>
                              <span className="font-semibold">{formattedRemaining}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Source de financement</span>
                              <span className="font-semibold">
                                {operation.origine_financement === "budget_national" ? "Budget national" : "Financement extérieur"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Crédits de Paiement (CP)</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b pb-1">
                              <span>CP Alloués</span>
                              <span className="font-semibold">{formatCurrency(operation.allocated_cp || 0)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>CP Consommés</span>
                              <span className="font-semibold">{formatCurrency(operation.consumed_cp || 0)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Taux de consommation CP</span>
                              <span className="font-semibold">
                                {operation.allocated_cp && operation.allocated_cp > 0
                                  ? (((operation.consumed_cp || 0) / operation.allocated_cp) * 100).toFixed(1)
                                  : "0"}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Dernière opération CP</span>
                              <span className="font-semibold">15/04/2025</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Progression Financière</h3>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Taux de consommation AE</span>
                            <span className="font-semibold">{consumptionRate}%</span>
                          </div>
                          <Progress
                            value={parseFloat(consumptionRate)}
                            className="h-2"
                            indicatorClassName={getProgressBarColor(parseFloat(consumptionRate))}
                          />
                        </div>
                        <div className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}</div>
                      </div>

                      {/* Crédits de paiement */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Crédits de paiement</h3>
                        <Tabs defaultValue="annuels" className="w-full">
                          <TabsList className="w-full justify-start">
                            <TabsTrigger value="annuels">CP Annuels</TabsTrigger>
                            <TabsTrigger value="demandes">Demandes de CP</TabsTrigger>
                          </TabsList>
                          <TabsContent value="annuels">
                            <div className="rounded-md border mt-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Année</TableHead>
                                    <TableHead>Montant alloué</TableHead>
                                    <TableHead>Montant consommé</TableHead>
                                    <TableHead>Taux de consommation</TableHead>
                                    <TableHead>Statut</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {mockCPAnnuels.map((cp) => (
                                    <TableRow key={cp.id}>
                                      <TableCell className="font-medium">{cp.annee}</TableCell>
                                      <TableCell>{formatCurrency(cp.montant_alloue)}</TableCell>
                                      <TableCell>{formatCurrency(cp.montant_consomme)}</TableCell>
                                      <TableCell>{cp.taux_consommation}%</TableCell>
                                      <TableCell>{cp.statut}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TabsContent>
                          <TabsContent value="demandes">
                            <div className="rounded-md border mt-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead>Motif</TableHead>
                                    <TableHead>Statut</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {mockDemandesCP.map((demande) => (
                                    <TableRow key={demande.id}>
                                      <TableCell>{demande.date}</TableCell>
                                      <TableCell>{formatCurrency(demande.montant)}</TableCell>
                                      <TableCell>{demande.motif}</TableCell>
                                      <TableCell>{demande.statut}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Mise en œuvre */}
              <TabsContent value="implementation">
                <Card>
                  <CardHeader>
                    <CardTitle>Détails de mise en œuvre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Calendrier</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b pb-1">
                              <span>Date de début</span>
                              <span className="font-semibold">{operation.start_date || "Non définie"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Date de fin prévue</span>
                              <span className="font-semibold">{operation.end_date || "Non définie"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Durée</span>
                              <span className="font-semibold">
                                {operation.start_date && operation.end_date
                                  ? `${Math.round(
                                      (new Date(operation.end_date).getTime() - new Date(operation.start_date).getTime()) / (1000 * 60 * 60 * 24)
                                    )} jours`
                                  : "Non définie"}
                              </span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Phase actuelle</span>
                              <span className="font-semibold">
                                {operation.status === "planned"
                                  ? "Planification"
                                  : operation.status === "in_progress"
                                  ? "Exécution"
                                  : operation.status === "completed"
                                  ? "Finalisée"
                                  : operation.status === "en_pause"
                                  ? "En pause"
                                  : operation.status === "arreter"
                                  ? "Arrêtée"
                                  : "Non définie"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Progression</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b pb-1">
                              <span>Achèvement physique</span>
                              <span className="font-semibold">{operation.physical_rate || 0}%</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Consommation financière</span>
                              <span className="font-semibold">{consumptionRate}%</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span>Statut actuel</span>
                              <div className="flex items-center gap-2">{getStatusBadge(operation.status)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Progression de mise en œuvre</h3>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Achèvement physique</span>
                            <span className="font-semibold">{operation.physical_rate || 0}%</span>
                          </div>
                          <Progress
                            value={operation.physical_rate || 0}
                            className="h-2"
                            indicatorClassName={getProgressBarColor(operation.physical_rate)}
                          />
                        </div>
                        <div className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}</div>
                      </div>

                      {/* Historique des engagements */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Historique des engagements</h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Bénéficiaire</TableHead>
                                <TableHead>Montant initial</TableHead>
                                <TableHead>Montant actuel</TableHead>
                                <TableHead>Statut</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockEngagementsHistory.map((engagement) => (
                                <TableRow key={engagement.id}>
                                  <TableCell className="font-medium">{engagement.reference}</TableCell>
                                  <TableCell>{engagement.date}</TableCell>
                                  <TableCell>{engagement.beneficiaire}</TableCell>
                                  <TableCell>{formatCurrency(engagement.montant_initial)}</TableCell>
                                  <TableCell>{formatCurrency(engagement.montant_actuel)}</TableCell>
                                  <TableCell>{engagement.statut}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Contrats */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Contrats</h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Enterprise</TableHead>
                                <TableHead>Date de signature</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Objet</TableHead>
                                <TableHead>Statut</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockContrats.map((contrat) => (
                                <TableRow key={contrat.id}>
                                  <TableCell className="font-medium">{contrat.reference}</TableCell>
                                  <TableCell>{contrat.enterprise}</TableCell>
                                  <TableCell>{contrat.date_signature}</TableCell>
                                  <TableCell>{formatCurrency(contrat.montant)}</TableCell>
                                  <TableCell>{contrat.objet}</TableCell>
                                  <TableCell>{contrat.statut}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Documents */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Documents de l'opération</CardTitle>
                    <Button variant="outline">Téléverser un document</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Documents fictifs */}
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-gray-100 h-48 flex items-center justify-center">
                          <FileText className="h-16 w-16 text-gray-400" />
                        </div>
                        <div className="p-3">
                          <p className="font-medium">Spécifications techniques</p>
                          <p className="text-xs text-gray-500">Ajouté le 15/03/2025</p>
                        </div>
                      </div>

                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-gray-100 h-48 flex items-center justify-center">
                          <FileText className="h-16 w-16 text-gray-400" />
                        </div>
                        <div className="p-3">
                          <p className="font-medium">Convention de financement</p>
                          <p className="text-xs text-gray-500">Ajouté le 02/04/2025</p>
                        </div>
                      </div>

                      <div className="border rounded-md overflow-hidden border-dashed flex flex-col items-center justify-center h-48">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Cliquez pour ajouter un document</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Observations */}
              <TabsContent value="observations">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Observations et notes</CardTitle>
                    <Button variant="outline">Ajouter une observation</Button>
                  </CardHeader>
                  <CardContent>
                    {operation.status === "en_pause" || operation.status === "arreter" ? (
                      <div className="space-y-4">
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                          <h3 className="font-semibold text-amber-800">Notification de suspension</h3>
                          <p className="text-amber-800">
                            Cette opération est actuellement suspendue en raison de contraintes budgétaires. Une reprise est prévue lors du prochain
                            exercice fiscal.
                          </p>
                          <div className="mt-2 text-sm text-amber-700">
                            <p>Ajouté par: Karim Hadj</p>
                            <p>Date: 28/04/2025</p>
                          </div>
                        </div>

                        <div className="border p-4 rounded-md">
                          <h3 className="font-semibold">Question administrative</h3>
                          <p className="text-gray-700">
                            L'approbation de la deuxième phase est toujours en attente auprès des autorités locales. Réunion de suivi prévue pour le 5
                            mai.
                          </p>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Ajouté par: Amina Benali</p>
                            <p>Date: 22/04/2025</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border p-4 rounded-md">
                          <h3 className="font-semibold">Observation générale</h3>
                          <p className="text-gray-700">
                            {operation.status === "in_progress"
                              ? "L'opération progresse comme prévu sans problèmes majeurs à signaler. Les réunions hebdomadaires de chantier se poursuivent selon le calendrier."
                              : operation.status === "planned"
                              ? "Les préparatifs de l'opération sont terminés. En attente de l'approbation finale pour commencer les travaux."
                              : operation.status === "completed"
                              ? "L'opération a été achevée conformément aux spécifications. Inspection finale terminée le 25 avril 2025."
                              : "L'opération a été annulée en raison d'une réaffectation budgétaire. Toutes les ressources ont été réassignées."}
                          </p>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Ajouté par: Ahmed Hamidi</p>
                            <p>Date: 30/04/2025</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
