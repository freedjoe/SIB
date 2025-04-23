import { useState } from "react";
import { Dashboard, DashboardHeader, DashboardSection } from "@/components/layout/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "./settings/Profile";
import SecuritySettings from "./settings/Security";
import LocalizationSettings from "./settings/Localization";
import BasicDataSettings from "./settings/BasicData";
import UsersSettings from "./settings/Users";
import RolesSettings from "./settings/Roles";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Dashboard>
      <DashboardHeader title="Paramètres" description="Gérez vos préférences et votre compte utilisateur" />

      <DashboardSection>
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl mb-8">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="localization">Localisation</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="roles">Rôles</TabsTrigger>
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

          <TabsContent value="users" className="pt-4">
            <UsersSettings />
          </TabsContent>

          <TabsContent value="roles" className="pt-4">
            <RolesSettings />
          </TabsContent>

          <TabsContent value="basicData" className="pt-4">
            <BasicDataSettings />
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </Dashboard>
  );
}
