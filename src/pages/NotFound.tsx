
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-8">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Page non trouvée</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Désolé, nous n'avons pas pu trouver la page que vous recherchez.
        </p>
        <Button asChild size="lg" className="shadow-subtle">
          <a href="/">Retour à l'accueil</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
