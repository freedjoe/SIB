import { useState } from "react";
import { Dashboard, DashboardHeader, DashboardSection } from "@/components/layout/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "./settings/Profile";
import SecuritySettings from "./settings/Security";
import LocalizationSettings from "./settings/Localization";
import BasicDataSettings from "./settings/BasicData";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Dashboard>
      <DashboardHeader title="Paramètres" description="Gérez vos préférences et votre compte utilisateur" />

      <DashboardSection>
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-8">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="localization">Localisation</TabsTrigger>
            <TabsTrigger value="basicData">Données de Base</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="pt-4">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="security" className="pt-4">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="localization" className="pt-4">
            <LocalizationSettings />
          </TabsContent>

          <TabsContent value="basicData" className="pt-4">
            <BasicDataSettings />
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </Dashboard>
  );
}
