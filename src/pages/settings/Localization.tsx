import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function LocalizationSettings() {
  const [formData, setFormData] = useState({
    language: "fr",
    timezone: "Africa/Algiers",
    dateFormat: "DD/MM/YYYY",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement localization update logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Localisation</CardTitle>
          <CardDescription>Gérez vos préférences de langue et de format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="fr" value="fr">
                  Français
                </SelectItem>
                <SelectItem key="ar" value="ar">
                  العربية
                </SelectItem>
                <SelectItem key="en" value="en">
                  English
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un fuseau horaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="Africa/Algiers" value="Africa/Algiers">
                  Alger (GMT+1)
                </SelectItem>
                <SelectItem key="Africa/Tunis" value="Africa/Tunis">
                  Tunis (GMT+1)
                </SelectItem>
                <SelectItem key="Africa/Casablanca" value="Africa/Casablanca">
                  Casablanca (GMT)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Format de date</Label>
            <Select value={formData.dateFormat} onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un format de date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="DD/MM/YYYY" value="DD/MM/YYYY">
                  DD/MM/YYYY
                </SelectItem>
                <SelectItem key="MM/DD/YYYY" value="MM/DD/YYYY">
                  MM/DD/YYYY
                </SelectItem>
                <SelectItem key="YYYY-MM-DD" value="YYYY-MM-DD">
                  YYYY-MM-DD
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Sauvegarder les préférences
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
