import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <Dashboard className="p-6">
      <DashboardHeader title="Questions Fréquentes" description="Trouvez des réponses aux questions les plus courantes" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Questions Générales</CardTitle>
            <CardDescription>Informations de base sur le système SIB</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Qu'est-ce que le système SIB ?</AccordionTrigger>
                <AccordionContent>
                  Le Système d'Information Budgétaire (SIB) est une plateforme web centralisée qui automatise et rationalise les processus de gestion
                  budgétaire. Il permet une gestion efficace et transparente des finances publiques.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Comment accéder au système ?</AccordionTrigger>
                <AccordionContent>
                  L'accès au système se fait via vos identifiants fournis par l'administration. En cas de problème de connexion, contactez le support
                  technique.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions Techniques</CardTitle>
            <CardDescription>Problèmes courants et solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-3">
                <AccordionTrigger>Que faire en cas d'erreur de connexion ?</AccordionTrigger>
                <AccordionContent>
                  Vérifiez votre connexion internet et assurez-vous d'utiliser les bons identifiants. Si le problème persiste, contactez le support
                  technique.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Comment réinitialiser mon mot de passe ?</AccordionTrigger>
                <AccordionContent>
                  Utilisez la fonction "Mot de passe oublié" sur la page de connexion. Un lien de réinitialisation vous sera envoyé par email.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
