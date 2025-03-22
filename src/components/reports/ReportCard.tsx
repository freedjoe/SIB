import { FileDown, FileText, Clock, Eye, Share2, Share } from "lucide-react";
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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  reportType?: string;
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
  reportType,
}: ReportCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

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
    
    toast.success(`Téléchargement du rapport : ${title}`);
  };

  const handleView = () => {
    if (onView) {
      onView(id);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleShare = (platform: string) => {
    const reportUrl = `${window.location.origin}/reports/${id}`;
    
    switch (platform) {
      case 'email':
        window.open(`mailto:?subject=Rapport: ${title}&body=Voici le rapport "${title}": ${reportUrl}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(reportUrl)
          .then(() => toast.success("Lien copié dans le presse-papier"))
          .catch(() => toast.error("Impossible de copier le lien"));
        break;
      default:
        setIsShareOpen(false);
    }
  };

  return (
    <>
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
            {reportType && (
              <div className="flex items-center text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                <span>Type: {reportType}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col gap-2">
          <div className="flex flex-row gap-2 w-full">
            <Button
              className="flex-1"
              variant={status === "ready" ? "default" : "outline"}
              disabled={status !== "ready"}
              onClick={handleDownload}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
            
            <Popover open={isShareOpen} onOpenChange={setIsShareOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={status !== "ready"}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="grid gap-1">
                  <h4 className="font-medium py-1 px-2">Partager le rapport</h4>
                  <Button 
                    variant="ghost" 
                    className="justify-start cursor-pointer" 
                    onClick={() => handleShare('email')}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Par email
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start cursor-pointer" 
                    onClick={() => handleShare('copy')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Copier le lien
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleView}
          >
            <Eye className="mr-2 h-4 w-4" />
            Voir les détails
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Détails du rapport</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">ID:</div>
                <div>{id}</div>
                <div className="text-muted-foreground">Statut:</div>
                <div className="flex items-center">{getStatusBadge()}</div>
                <div className="text-muted-foreground">Fréquence:</div>
                <div>{frequency}</div>
                <div className="text-muted-foreground">Date de génération:</div>
                <div>{date}</div>
                {reportType && (
                  <>
                    <div className="text-muted-foreground">Type de rapport:</div>
                    <div>{reportType}</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Contenu du rapport</div>
              <div className="rounded-md bg-muted p-4 text-sm">
                {status === "ready" ? (
                  <p>Ce rapport est disponible pour consultation et téléchargement.</p>
                ) : status === "pending" ? (
                  <p>Ce rapport est en cours de préparation et sera bientôt disponible.</p>
                ) : (
                  <p>Une erreur s'est produite lors de la génération de ce rapport. Veuillez réessayer ultérieurement.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
            {status === "ready" && (
              <>
                <Button onClick={() => handleShare('copy')}>
                  <Share className="mr-2 h-4 w-4" />
                  Partager
                </Button>
                <Button onClick={handleDownload}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
