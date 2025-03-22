
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
import { cn } from "@/lib/utils";

interface ReportCardProps {
  title: string;
  description?: string;
  date: string;
  frequency: string;
  status: "ready" | "pending" | "error";
  className?: string;
}

export function ReportCard({
  title,
  description,
  date,
  frequency,
  status,
  className,
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
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
      <CardFooter className="border-t pt-4">
        <Button
          className="w-full"
          variant={status === "ready" ? "default" : "outline"}
          disabled={status !== "ready"}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
      </CardFooter>
    </Card>
  );
}
