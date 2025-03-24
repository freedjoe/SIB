
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, Clock, CheckCircle, X, FileEdit, Eye, Trash2 } from "lucide-react";

interface ReportCardProps {
  id: string;
  title: string;
  description?: string;
  date: string;
  frequency: string;
  status: "ready" | "pending" | "error";
  filePath?: string;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

export function ReportCard({
  id,
  title,
  description,
  date,
  frequency,
  status,
  filePath,
  onView,
  onEdit,
  onDelete,
  onDownload
}: ReportCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold line-clamp-1">{title}</CardTitle>
          {status === "ready" && (
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400 gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Prêt</span>
            </Badge>
          )}
          {status === "pending" && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400 gap-1">
              <Clock className="h-3 w-3" />
              <span>En cours</span>
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400 gap-1">
              <X className="h-3 w-3" />
              <span>Erreur</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description || "Rapport détaillé généré automatiquement."}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-1 h-3.5 w-3.5" />
          <span>{date}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Fréquence : {frequency}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3 pb-3">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <FileEdit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {status === "ready" && onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <FileDown className="mr-1 h-4 w-4" />
            Télécharger
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
