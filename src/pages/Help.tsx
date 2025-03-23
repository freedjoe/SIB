
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Help() {
  const { t } = useTranslation();

  return (
    <Dashboard className="p-6">
      <DashboardHeader 
        title="Aide & Support"
        description="Guides, tutoriels et assistance pour SIGB"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Guide d'utilisation</CardTitle>
            <CardDescription>Documentation complète pour tous les modules</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Accédez à des guides détaillés sur l'utilisation de chaque module et fonctionnalité du système SIGB.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Questions fréquemment posées</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Trouvez des réponses aux questions les plus courantes concernant la gestion budgétaire et l'utilisation de SIGB.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Support technique</CardTitle>
            <CardDescription>Assistance et résolution de problèmes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contactez notre équipe technique pour obtenir de l'aide avec tout problème que vous pourriez rencontrer.
            </p>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
