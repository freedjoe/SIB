
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";

export default function Engagements() {
  const { t } = useTranslation();

  return (
    <Dashboard className="p-6">
      <DashboardHeader 
        title={t("app.navigation.engagements")}
        description="Gestion des engagements budgétaires"
      />
      <div>
        {/* Content will be implemented in future iterations */}
        <div className="p-8 text-center text-muted-foreground">
          Contenu des engagements sera implémenté dans les prochaines étapes.
        </div>
      </div>
    </Dashboard>
  );
}
