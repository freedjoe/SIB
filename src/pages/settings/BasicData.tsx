import { useNavigate } from "react-router-dom";
import { Building2, Users2, ShieldCheck, BookOpen, Building, FileSpreadsheet, Library, GitGraph, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dataCategories = [
  {
    title: "Ministères",
    description: "Gérez la liste des ministères et leurs informations",
    icon: Building2,
    path: "/settings/basic-data/ministries",
    color: "bg-blue-500",
  },
  {
    title: "Wilayas",
    description: "Gérez la liste des wilayas et leurs informations",
    icon: Map,
    path: "/settings/basic-data/wilayas",
    color: "bg-teal-500",
  },
  {
    title: "Utilisateurs",
    description: "Gérez les utilisateurs du système",
    icon: Users2,
    path: "/settings/users",
    color: "bg-green-500",
  },
  {
    title: "Rôles",
    description: "Gérez les rôles et permissions",
    icon: ShieldCheck,
    path: "/settings/roles",
    color: "bg-purple-500",
  },
  {
    title: "Catalogue Budget",
    description: "Gérez les classifications budgétaires",
    icon: BookOpen,
    path: "/settings/basic-data/budget-titles",
    color: "bg-orange-500",
  },
  {
    title: "Enterprises",
    description: "Gérez les enterprises et fournisseurs",
    icon: Building,
    path: "/settings/basic-data/entreprises",
    color: "bg-pink-500",
  },
  {
    title: "Types de Rapports",
    description: "Configurez les différents types de rapports",
    icon: FileSpreadsheet,
    path: "/settings/basic-data/report-types",
    color: "bg-yellow-500",
  },
  {
    title: "Nomenclatures",
    description: "Gérez les nomenclatures et références",
    icon: Library,
    path: "/settings/basic-data/nomenclature",
    color: "bg-indigo-500",
  },
  {
    title: "Workflows",
    description: "Configurez les flux de travail",
    icon: GitGraph,
    path: "/settings/basic-data/workflows",
    color: "bg-red-500",
  },
];

export default function BasicData() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Données de Base</h2>
        <p className="text-muted-foreground mt-2">Gérez les données de référence du système</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dataCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(category.path)}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${category.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
