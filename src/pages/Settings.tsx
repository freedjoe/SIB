
import { useState } from "react";
import { User, Save, Lock, Globe } from "lucide-react";
import { 
  Dashboard, 
  DashboardHeader, 
  DashboardSection 
} from "@/components/layout/Dashboard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  
  const profileForm = useForm({
    defaultValues: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@sigb.dz",
      role: "admin",
    }
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const languageForm = useForm({
    defaultValues: {
      language: "fr",
      currency: "DZD",
      dateFormat: "DD/MM/YYYY",
    }
  });

  const onProfileSubmit = (data: any) => {
    console.log("Profile data submitted:", data);
    // TODO: Implement profile update logic
  };

  const onPasswordSubmit = (data: any) => {
    console.log("Password data submitted:", data);
    // TODO: Implement password change logic
  };

  const onLanguageSubmit = (data: any) => {
    console.log("Language settings submitted:", data);
    // TODO: Implement language settings update logic
  };

  return (
    <Dashboard>
      <DashboardHeader 
        title="Paramètres" 
        description="Gérez vos préférences et votre compte utilisateur"
      />

      <DashboardSection>
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="localization">Localisation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Profil Utilisateur</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input placeholder="Prénom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rôle</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un rôle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="manager">Gestionnaire</SelectItem>
                              <SelectItem value="user">Utilisateur</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Le rôle détermine vos permissions dans le système
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez votre mot de passe et les paramètres de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe actuel</FormLabel>
                          <FormControl>
                            <Input placeholder="Mot de passe actuel" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nouveau mot de passe</FormLabel>
                          <FormControl>
                            <Input placeholder="Nouveau mot de passe" type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Le mot de passe doit contenir au moins 8 caractères
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input placeholder="Confirmer le mot de passe" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4">
                      <Button type="submit">
                        <Lock className="mr-2 h-4 w-4" />
                        Changer le mot de passe
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="localization" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Localisation</CardTitle>
                <CardDescription>
                  Configurez vos préférences régionales et linguistiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...languageForm}>
                  <form onSubmit={languageForm.handleSubmit(onLanguageSubmit)} className="space-y-4">
                    <FormField
                      control={languageForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Langue</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une langue" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="ar">العربية</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={languageForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Devise</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une devise" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DZD">Dinar Algérien (DZD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="USD">Dollar Américain (USD)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={languageForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Format de date</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un format de date" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4">
                      <Button type="submit">
                        <Globe className="mr-2 h-4 w-4" />
                        Enregistrer les préférences
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </Dashboard>
  );
}
