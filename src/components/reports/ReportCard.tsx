
import { FileDown, FileText, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  id: string;
  title: string;
  description?: string;
  date: string;
  frequency: string;
  status: "ready" | "pending" | "error";
  filePath?: string;
  className?: string;
  onView?: (id: string) => void;
}

export function ReportCard({
  id,
  title,
  description,
  date,
  frequency,
  status,
  filePath,
  className,
  onView,
}: ReportCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
            Prêt
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400">
            En préparation
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400">
            Erreur
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDownload = () => {
    if (status !== "ready") {
      toast.error("Ce rapport n'est pas encore prêt pour le téléchargement");
      return;
    }
    
    if (!filePath) {
      toast.error("Aucun fichier disponible pour ce rapport");
      return;
    }
    
    // In a real app, this would download the file from Supabase Storage
    toast.success(`Téléchargement du rapport : ${title}`);
  };

  const handleView = () => {
    if (onView) {
      onView(id);
    }
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {getStatusBadge()}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <FileText className="mr-2 h-4 w-4" />
            <span>Fréquence: {frequency}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Généré le: {date}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-col gap-2">
        <Button
          className="w-full"
          variant={status === "ready" ? "default" : "outline"}
          disabled={status !== "ready"}
          onClick={handleDownload}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleView}
        >
          <FileText className="mr-2 h-4 w-4" />
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  );
}
