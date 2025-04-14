import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Help() {
  const { t } = useTranslation();

  return (
    <Dashboard className="p-6">
      <DashboardHeader title="Aide & Support" description="Guides, tutoriels et assistance pour SIB" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/help/presentation">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle>Présentation du Système</CardTitle>
              <CardDescription>Découvrez les différents modules et leurs fonctionnalités</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explorez une présentation complète du système SIB, ses modules et son cycle de gestion budgétaire.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/help/guide">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle>Guide d'utilisation</CardTitle>
              <CardDescription>Documentation complète pour tous les modules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accédez à des guides détaillés sur l'utilisation de chaque module et fonctionnalité du système SIB.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/help/faq">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Questions fréquemment posées</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trouvez des réponses aux questions les plus courantes concernant la gestion budgétaire et l'utilisation de SIB.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/help/support">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
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
        </Link>
      </div>
    </Dashboard>
  );
}
