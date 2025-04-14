import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HelpSupport() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/help")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l'aide
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Support Technique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Contactez notre équipe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <CardTitle className="text-lg">Support par Email</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Pour toute assistance technique, envoyez-nous un email à :</p>
                    <a href="mailto:support@sib.com" className="text-primary hover:underline mt-2 block">
                      support@sib.com
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5" />
                      <CardTitle className="text-lg">Support Téléphonique</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Notre équipe est disponible du lundi au vendredi :</p>
                    <p className="mt-2">
                      <span className="font-medium">Tél :</span> +33 1 23 45 67 89
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Horaires de Support</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="h-5 w-5" />
                    <p className="font-medium">Lundi - Vendredi</p>
                  </div>
                  <p className="text-muted-foreground">9h00 - 18h00 (Heure de Paris)</p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Procédure de Support</h2>
              <div className="space-y-4">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Décrivez clairement votre problème ou votre question</li>
                  <li>Fournissez les informations pertinentes (numéro de version, navigateur, etc.)</li>
                  <li>Joignez des captures d'écran si nécessaire</li>
                  <li>Précisez les étapes pour reproduire le problème</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Ressources Additionnelles</h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Consultez notre{" "}
                    <a href="/help/guide" className="text-primary hover:underline">
                      guide d'utilisation
                    </a>
                  </li>
                  <li>
                    Parcourez les{" "}
                    <a href="/help/faq" className="text-primary hover:underline">
                      questions fréquentes
                    </a>
                  </li>
                  <li>
                    Accédez à notre{" "}
                    <a href="/help/presentation" className="text-primary hover:underline">
                      documentation technique
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
