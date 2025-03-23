
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";

export default function Portfolios() {
  const { t } = useTranslation();

  return (
    <Dashboard className="p-6">
      <DashboardHeader 
        title={t("app.navigation.portfolios")}
        description="Gestion des portefeuilles de programmes"
      />
      <div>
        {/* Content will be implemented in future iterations */}
        <div className="p-8 text-center text-muted-foreground">
          Contenu des portefeuilles sera implémenté dans les prochaines étapes.
        </div>
      </div>
    </Dashboard>
  );
}
