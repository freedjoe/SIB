
import { useState } from "react";
import { Shield, FileDown, Search } from "lucide-react";
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
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for audit controls
const auditControlsData = [
  {
    id: "control-1",
    date: "2023-07-15",
    type: "Contrôle de régularité",
    entity: "Programme d'Education",
    controller: "Ahmed Benali",
    result: "conforme"
  },
  {
    id: "control-2",
    date: "2023-07-10",
    type: "Contrôle de performance",
    entity: "Engagement #E2023-156",
    controller: "Fatima Zahra",
    result: "anomalie"
  },
  {
    id: "control-3",
    date: "2023-07-05",
    type: "Contrôle budgétaire",
    entity: "Paiement #P2023-089",
    controller: "Karim Messoudi",
    result: "partiellement"
  },
  {
    id: "control-4",
    date: "2023-06-28",
    type: "Contrôle de régularité",
    entity: "Programme de Santé",
    controller: "Leila Mansouri",
    result: "conforme"
  },
  {
    id: "control-5",
    date: "2023-06-22",
    type: "Contrôle de performance",
    entity: "Engagement #E2023-132",
    controller: "Mohammed El Khatib",
    result: "conforme"
  },
];

// Mock data for audit logs
const auditLogsData = [
  {
    id: "log-1",
    timestamp: "2023-07-28T14:35:42",
    user: "admin@sigb.dz",
    action: "Modification de budget",
    details: "Budget modifié pour le Ministère de l'Éducation",
    ipAddress: "192.168.1.105"
  },
  {
    id: "log-2",
    timestamp: "2023-07-28T12:18:23",
    user: "finance@sigb.dz",
    action: "Approbation d'engagement",
    details: "Engagement #E2023-167 approuvé",
    ipAddress: "192.168.1.112"
  },
  {
    id: "log-3",
    timestamp: "2023-07-27T16:45:10",
    user: "admin@sigb.dz",
    action: "Création d'utilisateur",
    details: "Nouvel utilisateur créé: controle@sigb.dz",
    ipAddress: "192.168.1.105"
  },
  {
    id: "log-4",
    timestamp: "2023-07-27T10:22:51",
    user: "operation@sigb.dz",
    action: "Création d'opération",
    details: "Nouvelle opération créée dans le Programme d'Infrastructure",
    ipAddress: "192.168.1.118"
  },
  {
    id: "log-5",
    timestamp: "2023-07-26T14:08:32",
    user: "admin@sigb.dz",
    action: "Modification de rôle",
    details: "Rôle modifié pour finance@sigb.dz: Contrôleur -> Administrateur",
    ipAddress: "192.168.1.105"
  },
];

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  return new Date(timestamp).toLocaleDateString('fr-FR', options);
};

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredControls = auditControlsData.filter(control => 
    control.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.controller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredLogs = auditLogsData.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResultBadge = (result: string) => {
    switch (result) {
      case "conforme":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">Conforme</Badge>;
      case "anomalie":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400">Anomalie détectée</Badge>;
      case "partiellement":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400">Partiellement conforme</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dashboard>
      <DashboardHeader 
        title="Contrôles & Audits" 
        description="Suivez les contrôles financiers et consultez les logs d'audit"
      >
        <Button className="shadow-subtle">
          <FileDown className="mr-2 h-4 w-4" />
          Exporter les logs
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Rechercher</CardTitle>
            <CardDescription>
              Recherchez dans les contrôles et les logs d'audit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par entité, contrôleur, action, utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
      </DashboardSection>

      <DashboardSection>
        <Tabs defaultValue="controls" className="w-full">
          <TabsList>
            <TabsTrigger value="controls">Rapport des Contrôles Financiers</TabsTrigger>
            <TabsTrigger value="logs">Logs d'Audit</TabsTrigger>
          </TabsList>
          <TabsContent value="controls" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Contrôles Financiers</CardTitle>
                <CardDescription>
                  Liste des contrôles financiers effectués sur le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type de Contrôle</TableHead>
                      <TableHead>Entité</TableHead>
                      <TableHead>Contrôleur</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredControls.length > 0 ? (
                      filteredControls.map((control) => (
                        <TableRow key={control.id}>
                          <TableCell>{formatDate(control.date)}</TableCell>
                          <TableCell>{control.type}</TableCell>
                          <TableCell>{control.entity}</TableCell>
                          <TableCell>{control.controller}</TableCell>
                          <TableCell>{getResultBadge(control.result)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Shield className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Aucun contrôle trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="logs" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs d'Audit</CardTitle>
                <CardDescription>
                  Historique des actions effectuées sur le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horodatage</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Détails</TableHead>
                      <TableHead>Adresse IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.details}</TableCell>
                          <TableCell>{log.ipAddress}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Aucun log trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </Dashboard>
  );
}
