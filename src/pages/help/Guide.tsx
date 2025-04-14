import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HelpGuide() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/help")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l'aide
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Guide d'Utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Premiers Pas</h2>
              <div className="space-y-4">
                <p>Ce guide vous accompagne dans l'utilisation du système. Suivez ces étapes pour bien démarrer :</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Connectez-vous avec vos identifiants</li>
                  <li>Explorez le tableau de bord pour une vue d'ensemble</li>
                  <li>Consultez les différents modules selon vos besoins</li>
                  <li>Utilisez les filtres et options de recherche pour trouver rapidement les informations</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Navigation</h2>
              <div className="space-y-4">
                <p>Le système est organisé en plusieurs sections principales :</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tableau de bord : Vue d'ensemble des indicateurs clés</li>
                  <li>Portefeuille : Gestion des programmes et actions</li>
                  <li>Engagements : Suivi des engagements budgétaires</li>
                  <li>Paiements : Gestion des transactions financières</li>
                  <li>Prévisions : Planification des dépenses futures</li>
                  <li>Rapports : Génération et consultation des rapports</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Fonctionnalités Avancées</h2>
              <div className="space-y-4">
                <h3 className="font-medium">Recherche et Filtres</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Utilisez la barre de recherche pour trouver rapidement des éléments</li>
                  <li>Appliquez des filtres pour affiner vos résultats</li>
                  <li>Enregistrez vos filtres préférés pour un accès rapide</li>
                </ul>

                <h3 className="font-medium">Export de Données</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Exportez les données au format Excel ou PDF</li>
                  <li>Personnalisez les colonnes à exporter</li>
                  <li>Planifiez des exports automatiques</li>
                </ul>

                <h3 className="font-medium">Notifications</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Configurez vos préférences de notification</li>
                  <li>Recevez des alertes pour les événements importants</li>
                  <li>Gérez vos notifications dans le centre de notifications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Bonnes Pratiques</h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Mettez régulièrement à jour vos informations</li>
                  <li>Utilisez les commentaires pour documenter vos actions</li>
                  <li>Consultez régulièrement les rapports d'activité</li>
                  <li>Respectez les délais de validation et d'approbation</li>
                  <li>Maintenez vos données à jour pour une meilleure traçabilité</li>
                </ul>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
