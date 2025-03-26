import { useState } from "react";
import { User, Save, Lock, Globe, Building, Users, BookOpen, Plus, FileEdit, Trash2, Eye } from "lucide-react";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

// Mock data interfaces
interface Ministry {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  sector: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  ministryId?: string;
  ministryName?: string;
}

// Mock data for ministries
const mockMinistries: Ministry[] = [
  {
    id: "m1",
    code: "MEDU",
    name: "Ministère de l'Éducation Nationale",
    createdAt: "2023-01-15",
  },
  {
    id: "m2",
    code: "MSANTE",
    name: "Ministère de la Santé",
    createdAt: "2023-01-15",
  },
  {
    id: "m3",
    code: "MTRANS",
    name: "Ministère des Transports",
    createdAt: "2023-01-15",
  },
  {
    id: "m4",
    code: "MAGRI",
    name: "Ministère de l'Agriculture",
    createdAt: "2023-01-15",
  },
  {
    id: "m5",
    code: "MDEF",
    name: "Ministère de la Défense",
    createdAt: "2023-01-15",
  },
];

// Mock data for companies
const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "Entreprise de construction ABC",
    sector: "Construction",
    registrationNumber: "RC123456789",
    contactPerson: "Ahmed Benali",
    email: "contact@abc-construction.dz",
    phone: "+213555123456",
  },
  {
    id: "c2",
    name: "MedEquip International",
    sector: "Équipement Médical",
    registrationNumber: "RC987654321",
    contactPerson: "Sarah Hamdi",
    email: "info@medequip.dz",
    phone: "+213555789123",
  },
  {
    id: "c3",
    name: "Routes & Ponts SA",
    sector: "Infrastructure",
    registrationNumber: "RC456789123",
    contactPerson: "Karim Meziane",
    email: "contact@routesponts.dz",
    phone: "+213555456789",
  },
];

// Mock data for roles
const mockRoles: Role[] = [
  {
    id: "r1",
    name: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités du système",
    permissions: ["create", "read", "update", "delete", "approve", "report"],
  },
  {
    id: "r2",
    name: "Gestionnaire",
    description: "Gestion des budgets, programmes et opérations",
    permissions: ["create", "read", "update", "approve"],
  },
  {
    id: "r3",
    name: "Utilisateur",
    description: "Consultation des données sans modification",
    permissions: ["read"],
  },
  {
    id: "r4",
    name: "Auditeur",
    description: "Contrôle et vérification des opérations",
    permissions: ["read", "report"],
  },
];

// Mock data for users
const mockUsers: User[] = [
  {
    id: "u1",
    firstName: "Admin",
    lastName: "User",
    email: "admin@sib.dz",
    role: "Administrateur",
  },
  {
    id: "u2",
    firstName: "Karima",
    lastName: "Hadj",
    email: "karima.hadj@edu.dz",
    role: "Gestionnaire",
    ministryId: "m1",
    ministryName: "Ministère de l'Éducation Nationale",
  },
  {
    id: "u3",
    firstName: "Mohamed",
    lastName: "Cherif",
    email: "mohamed.cherif@sante.dz",
    role: "Gestionnaire",
    ministryId: "m2",
    ministryName: "Ministère de la Santé",
  },
];

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeDataTab, setActiveDataTab] = useState("ministries");

  // State for basic data
  const [ministries, setMinistries] = useState<Ministry[]>(mockMinistries);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Modal states
  const [isMinistryDialogOpen, setIsMinistryDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [currentMinistry, setCurrentMinistry] = useState<Ministry | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");

  // Forms
  const profileForm = useForm({
    defaultValues: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@sib.dz",
      role: "admin",
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const languageForm = useForm({
    defaultValues: {
      language: "fr",
      currency: "DZD",
      dateFormat: "DD/MM/YYYY",
    },
  });

  const ministryForm = useForm({
    defaultValues: {
      code: "",
      name: "",
    },
  });

  const companyForm = useForm({
    defaultValues: {
      name: "",
      sector: "",
      registrationNumber: "",
      contactPerson: "",
      email: "",
      phone: "",
    },
  });

  const roleForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      permissions: [] as string[],
    },
  });

  const userForm = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      ministryId: "",
    },
  });

  // Form submit handlers
  const onProfileSubmit = (data: any) => {
    console.log("Profile data submitted:", data);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations de profil ont été mises à jour avec succès.",
    });
  };

  const onPasswordSubmit = (data: any) => {
    console.log("Password data submitted:", data);
    toast({
      title: "Mot de passe changé",
      description: "Votre mot de passe a été changé avec succès.",
    });
  };

  const onLanguageSubmit = (data: any) => {
    console.log("Language settings submitted:", data);
    toast({
      title: "Préférences mises à jour",
      description: "Vos préférences linguistiques ont été mises à jour avec succès.",
    });
  };

  // Ministry dialog handlers
  const handleOpenAddMinistryDialog = () => {
    setDialogMode("add");
    ministryForm.reset({
      code: "",
      name: "",
    });
    setIsMinistryDialogOpen(true);
  };

  const handleOpenEditMinistryDialog = (ministry: Ministry) => {
    setDialogMode("edit");
    setCurrentMinistry(ministry);
    ministryForm.reset({
      code: ministry.code,
      name: ministry.name,
    });
    setIsMinistryDialogOpen(true);
  };

  const handleOpenViewMinistryDialog = (ministry: Ministry) => {
    setDialogMode("view");
    setCurrentMinistry(ministry);
    setIsMinistryDialogOpen(true);
  };

  const handleOpenDeleteMinistryDialog = (ministry: Ministry) => {
    setDialogMode("delete");
    setCurrentMinistry(ministry);
    setIsMinistryDialogOpen(true);
  };

  const handleSaveMinistry = (data: any) => {
    if (dialogMode === "add") {
      const newMinistry: Ministry = {
        id: `m${ministries.length + 1}`,
        code: data.code,
        name: data.name,
        createdAt: new Date().toISOString(),
      };
      setMinistries([...ministries, newMinistry]);
      toast({
        title: "Ministère ajouté",
        description: `Le ministère "${data.name}" a été ajouté avec succès.`,
      });
    } else if (dialogMode === "edit" && currentMinistry) {
      const updatedMinistries = ministries.map((m) => (m.id === currentMinistry.id ? { ...m, code: data.code, name: data.name } : m));
      setMinistries(updatedMinistries);
      toast({
        title: "Ministère modifié",
        description: `Le ministère "${data.name}" a été modifié avec succès.`,
      });
    }
    setIsMinistryDialogOpen(false);
  };

  const handleDeleteMinistry = () => {
    if (!currentMinistry) return;
    const updatedMinistries = ministries.filter((m) => m.id !== currentMinistry.id);
    setMinistries(updatedMinistries);
    setIsMinistryDialogOpen(false);
    toast({
      title: "Ministère supprimé",
      description: `Le ministère "${currentMinistry.name}" a été supprimé avec succès.`,
    });
  };

  // Company dialog handlers
  const handleOpenAddCompanyDialog = () => {
    setDialogMode("add");
    companyForm.reset({
      name: "",
      sector: "",
      registrationNumber: "",
      contactPerson: "",
      email: "",
      phone: "",
    });
    setIsCompanyDialogOpen(true);
  };

  const handleOpenEditCompanyDialog = (company: Company) => {
    setDialogMode("edit");
    setCurrentCompany(company);
    companyForm.reset({
      name: company.name,
      sector: company.sector,
      registrationNumber: company.registrationNumber,
      contactPerson: company.contactPerson,
      email: company.email,
      phone: company.phone,
    });
    setIsCompanyDialogOpen(true);
  };

  const handleOpenViewCompanyDialog = (company: Company) => {
    setDialogMode("view");
    setCurrentCompany(company);
    setIsCompanyDialogOpen(true);
  };

  const handleOpenDeleteCompanyDialog = (company: Company) => {
    setDialogMode("delete");
    setCurrentCompany(company);
    setIsCompanyDialogOpen(true);
  };

  const handleSaveCompany = (data: any) => {
    if (dialogMode === "add") {
      const newCompany: Company = {
        id: `c${companies.length + 1}`,
        name: data.name,
        sector: data.sector,
        registrationNumber: data.registrationNumber,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
      };
      setCompanies([...companies, newCompany]);
      toast({
        title: "Entreprise ajoutée",
        description: `L'entreprise "${data.name}" a été ajoutée avec succès.`,
      });
    } else if (dialogMode === "edit" && currentCompany) {
      const updatedCompanies = companies.map((c) => (c.id === currentCompany.id ? { ...c, ...data } : c));
      setCompanies(updatedCompanies);
      toast({
        title: "Entreprise modifiée",
        description: `L'entreprise "${data.name}" a été modifiée avec succès.`,
      });
    }
    setIsCompanyDialogOpen(false);
  };

  const handleDeleteCompany = () => {
    if (!currentCompany) return;
    const updatedCompanies = companies.filter((c) => c.id !== currentCompany.id);
    setCompanies(updatedCompanies);
    setIsCompanyDialogOpen(false);
    toast({
      title: "Entreprise supprimée",
      description: `L'entreprise "${currentCompany.name}" a été supprimée avec succès.`,
    });
  };

  // Role dialog handlers
  const handleOpenAddRoleDialog = () => {
    setDialogMode("add");
    roleForm.reset({
      name: "",
      description: "",
      permissions: [],
    });
    setIsRoleDialogOpen(true);
  };

  const handleOpenEditRoleDialog = (role: Role) => {
    setDialogMode("edit");
    setCurrentRole(role);
    roleForm.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsRoleDialogOpen(true);
  };

  const handleOpenViewRoleDialog = (role: Role) => {
    setDialogMode("view");
    setCurrentRole(role);
    setIsRoleDialogOpen(true);
  };

  const handleOpenDeleteRoleDialog = (role: Role) => {
    setDialogMode("delete");
    setCurrentRole(role);
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = (data: any) => {
    if (dialogMode === "add") {
      const newRole: Role = {
        id: `r${roles.length + 1}`,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      };
      setRoles([...roles, newRole]);
      toast({
        title: "Rôle ajouté",
        description: `Le rôle "${data.name}" a été ajouté avec succès.`,
      });
    } else if (dialogMode === "edit" && currentRole) {
      const updatedRoles = roles.map((r) => (r.id === currentRole.id ? { ...r, ...data } : r));
      setRoles(updatedRoles);
      toast({
        title: "Rôle modifié",
        description: `Le rôle "${data.name}" a été modifié avec succès.`,
      });
    }
    setIsRoleDialogOpen(false);
  };

  const handleDeleteRole = () => {
    if (!currentRole) return;
    const updatedRoles = roles.filter((r) => r.id !== currentRole.id);
    setRoles(updatedRoles);
    setIsRoleDialogOpen(false);
    toast({
      title: "Rôle supprimé",
      description: `Le rôle "${currentRole.name}" a été supprimé avec succès.`,
    });
  };

  // User dialog handlers
  const handleOpenAddUserDialog = () => {
    setDialogMode("add");
    userForm.reset({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      ministryId: "",
    });
    setIsUserDialogOpen(true);
  };

  const handleOpenEditUserDialog = (user: User) => {
    setDialogMode("edit");
    setCurrentUser(user);
    userForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      ministryId: user.ministryId || "",
    });
    setIsUserDialogOpen(true);
  };

  const handleOpenViewUserDialog = (user: User) => {
    setDialogMode("view");
    setCurrentUser(user);
    setIsUserDialogOpen(true);
  };

  const handleOpenDeleteUserDialog = (user: User) => {
    setDialogMode("delete");
    setCurrentUser(user);
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = (data: any) => {
    if (dialogMode === "add") {
      const ministry = ministries.find((m) => m.id === data.ministryId);
      const newUser: User = {
        id: `u${users.length + 1}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        ministryId: data.ministryId || undefined,
        ministryName: ministry?.name,
      };
      setUsers([...users, newUser]);
      toast({
        title: "Utilisateur ajouté",
        description: `L'utilisateur "${data.firstName} ${data.lastName}" a été ajouté avec succès.`,
      });
    } else if (dialogMode === "edit" && currentUser) {
      const ministry = ministries.find((m) => m.id === data.ministryId);
      const updatedUsers = users.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              ...data,
              ministryName: ministry?.name,
            }
          : u
      );
      setUsers(updatedUsers);
      toast({
        title: "Utilisateur modifié",
        description: `L'utilisateur "${data.firstName} ${data.lastName}" a été modifié avec succès.`,
      });
    }
    setIsUserDialogOpen(false);
  };

  const handleDeleteUser = () => {
    if (!currentUser) return;
    const updatedUsers = users.filter((u) => u.id !== currentUser.id);
    setUsers(updatedUsers);
    setIsUserDialogOpen(false);
    toast({
      title: "Utilisateur supprimé",
      description: `L'utilisateur "${currentUser.firstName} ${currentUser.lastName}" a été supprimé avec succès.`,
    });
  };

  // Render permission badges
  const renderPermissionBadges = (permissions: string[]) => {
    return permissions.map((permission, index) => {
      let badgeClass = "";
      switch (permission) {
        case "create":
          badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400";
          break;
        case "read":
          badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400";
          break;
        case "update":
          badgeClass = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-400";
          break;
        case "delete":
          badgeClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400";
          break;
        case "approve":
          badgeClass = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400";
          break;
        case "report":
          badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400";
          break;
      }
      return (
        <Badge key={index} variant="outline" className={badgeClass}>
          {permission}
        </Badge>
      );
    });
  };

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
            <Card>
              <CardHeader>
                <CardTitle>Profil Utilisateur</CardTitle>
                <CardDescription>Gérez vos informations personnelles</CardDescription>
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
                          <FormDescription>Le rôle détermine vos permissions dans le système</FormDescription>
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
                <CardDescription>Gérez votre mot de passe et les paramètres de sécurité</CardDescription>
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
                          <FormDescription>Le mot de passe doit contenir au moins 8 caractères</FormDescription>
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
                <CardDescription>Configurez vos préférences régionales et linguistiques</CardDescription>
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

          <TabsContent value="basicData" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Données de Base</CardTitle>
                <CardDescription>Gérez les données de référence du système</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ministries" value={activeDataTab} onValueChange={setActiveDataTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="ministries">Ministères</TabsTrigger>
                    <TabsTrigger value="companies">Entreprises</TabsTrigger>
                    <TabsTrigger value="roles">Rôles</TabsTrigger>
                    <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ministries">
                    <div className="flex justify-end mb-4">
                      <Button onClick={handleOpenAddMinistryDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un ministère
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Date de création</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ministries.map((ministry) => (
                          <TableRow key={ministry.id}>
                            <TableCell>{ministry.code}</TableCell>
                            <TableCell>{ministry.name}</TableCell>
                            <TableCell>{formatDate(ministry.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenViewMinistryDialog(ministry)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditMinistryDialog(ministry)}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteMinistryDialog(ministry)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="companies">
                    <div className="flex justify-end mb-4">
                      <Button onClick={handleOpenAddCompanyDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une entreprise
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Secteur</TableHead>
                          <TableHead>N° d'immatriculation</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies.map((company) => (
                          <TableRow key={company.id}>
                            <TableCell>{company.name}</TableCell>
                            <TableCell>{company.sector}</TableCell>
                            <TableCell>{company.registrationNumber}</TableCell>
                            <TableCell>{company.contactPerson}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenViewCompanyDialog(company)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditCompanyDialog(company)}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteCompanyDialog(company)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="roles">
                    <div className="flex justify-end mb-4">
                      <Button onClick={handleOpenAddRoleDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un rôle
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell>{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">{renderPermissionBadges(role.permissions)}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenViewRoleDialog(role)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditRoleDialog(role)}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteRoleDialog(role)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="users">
                    <div className="flex justify-end mb-4">
                      <Button onClick={handleOpenAddUserDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un utilisateur
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Ministère</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.ministryName || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenViewUserDialog(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditUserDialog(user)}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteUserDialog(user)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>

      {/* Ministry Dialogs */}
      <Dialog open={isMinistryDialogOpen} onOpenChange={setIsMinistryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un ministère"
                : dialogMode === "edit"
                  ? "Modifier le ministère"
                  : dialogMode === "view"
                    ? "Détails du ministère"
                    : "Supprimer le ministère"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Complétez le formulaire pour créer un nouveau ministère."
                : dialogMode === "edit"
                  ? "Modifiez les détails du ministère."
                  : dialogMode === "view"
                    ? "Informations détaillées sur le ministère."
                    : "Êtes-vous sûr de vouloir supprimer ce ministère? Cette action est irréversible."}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "view" && currentMinistry ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Code:</div>
                <div>{currentMinistry.code}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nom:</div>
                <div>{currentMinistry.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Date de création:</div>
                <div>{formatDate(currentMinistry.createdAt)}</div>
              </div>
            </div>
          ) : dialogMode === "delete" && currentMinistry ? (
            <div className="py-4">
              <p>
                <strong>Code:</strong> {currentMinistry.code}
              </p>
              <p>
                <strong>Nom:</strong> {currentMinistry.name}
              </p>
            </div>
          ) : dialogMode === "add" || dialogMode === "edit" ? (
            <Form {...ministryForm}>
              <form onSubmit={ministryForm.handleSubmit(handleSaveMinistry)}>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={ministryForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Code du ministère" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ministryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du ministère" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMinistryDialogOpen(false)} type="button">
                    Annuler
                  </Button>
                  <Button type="submit">{dialogMode === "add" ? "Ajouter" : "Enregistrer"}</Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}

          {(dialogMode === "view" || dialogMode === "delete") && (
            <DialogFooter>
              {dialogMode === "view" ? (
                <Button onClick={() => setIsMinistryDialogOpen(false)}>Fermer</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsMinistryDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteMinistry}>
                    Supprimer
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Company Dialogs, Role Dialogs, and User Dialogs would be similar to Ministry Dialogs */}
      {/* For brevity, those dialogs are not fully implemented here, but would follow the same pattern */}
    </Dashboard>
  );
}
