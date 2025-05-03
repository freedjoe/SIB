import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, Plus, Search, Save, Trash2, Edit, X } from "lucide-react";
import { useLoading } from "@/hooks/useLoading";
import { useTranslation } from "react-i18next";

// Type for translation data
interface TranslationData {
  [key: string]: string | TranslationData;
}

// Function to flatten nested translation object
const flattenTranslations = (obj: TranslationData, prefix = "", result: { key: string; value: string; path: string[] }[] = []) => {
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    const path = newPrefix.split(".");

    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenTranslations(obj[key] as TranslationData, newPrefix, result);
    } else {
      result.push({ key: newPrefix, value: obj[key] as string, path });
    }
  }

  return result;
};

// Function to get value from nested object using path
const getNestedValue = (obj: TranslationData, path: string[]): string | TranslationData | undefined => {
  if (path.length === 0 || !obj) return obj;

  const [first, ...rest] = path;
  const value = obj[first];

  if (rest.length === 0 || value === undefined) return value as string;
  if (typeof value === "object" && value !== null) return getNestedValue(value as TranslationData, rest);

  return undefined;
};

// Function to set value in nested object using path
const setNestedValue = (obj: TranslationData, path: string[], value: string): TranslationData => {
  const result = { ...obj };

  if (path.length === 1) {
    result[path[0]] = value;
    return result;
  }

  const [first, ...rest] = path;

  if (!result[first] || typeof result[first] !== "object") {
    result[first] = {};
  }

  result[first] = setNestedValue(result[first] as TranslationData, rest, value);

  return result;
};

// Function to delete value from nested object using path
const deleteNestedValue = (obj: TranslationData, path: string[]): TranslationData => {
  const result = { ...obj };

  if (path.length === 1) {
    delete result[path[0]];
    return result;
  }

  const [first, ...rest] = path;

  if (result[first] && typeof result[first] === "object") {
    result[first] = deleteNestedValue(result[first] as TranslationData, rest);

    // If the object is now empty, delete it
    if (Object.keys(result[first] as TranslationData).length === 0) {
      delete result[first];
    }
  }

  return result;
};

export default function Translation() {
  const { toast } = useToast();
  const { setLoading } = useLoading();
  const { t, i18n } = useTranslation();
  const [activeLanguage, setActiveLanguage] = useState<"en" | "fr" | "ar">("en");

  // Load translations from i18n instance
  const [translations, setTranslations] = useState<{
    en: TranslationData;
    fr: TranslationData;
    ar: TranslationData;
  }>({
    en: (i18n.getDataByLanguage("en")?.translation as TranslationData) || {},
    fr: (i18n.getDataByLanguage("fr")?.translation as TranslationData) || {},
    ar: (i18n.getDataByLanguage("ar")?.translation as TranslationData) || {},
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTranslationKey, setNewTranslationKey] = useState("");
  const [newTranslationValues, setNewTranslationValues] = useState({
    en: "",
    fr: "",
    ar: "",
  });
  const [editPath, setEditPath] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmPath, setDeleteConfirmPath] = useState<string[]>([]);

  const flattenedTranslations = flattenTranslations(translations[activeLanguage]);

  // Filter translations based on search query
  const filteredTranslations = searchQuery
    ? flattenedTranslations.filter(
        (item) => item.key.toLowerCase().includes(searchQuery.toLowerCase()) || item.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : flattenedTranslations;

  // Function to toggle expanded state for a path
  const toggleExpand = (path: string) => {
    const newExpandedPaths = new Set(expandedPaths);

    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }

    setExpandedPaths(newExpandedPaths);
  };

  // Check if a path is expanded
  const isExpanded = (path: string) => expandedPaths.has(path);

  // Check if a key has children
  const hasChildren = (key: string) => {
    const prefix = key + ".";
    return flattenedTranslations.some((item) => item.key.startsWith(prefix));
  };

  // Get direct children of a path
  const getDirectChildren = (path: string) => {
    const prefix = path ? path + "." : "";
    const directChildren = new Set<string>();

    flattenedTranslations
      .filter((item) => item.key.startsWith(prefix) && item.key !== path)
      .forEach((item) => {
        const remainingPath = item.key.substring(prefix.length);
        const firstSegment = remainingPath.split(".")[0];
        directChildren.add(prefix + firstSegment);
      });

    return Array.from(directChildren).sort();
  };

  // Save translations to files
  const saveTranslations = async () => {
    try {
      setLoading(true);

      // In a real implementation, we would write the translation files to disk
      // Since we can't directly write to disk from the browser, we'll use a
      // simulated implementation that updates the i18n instance in memory

      // Convert translations to JSON strings
      const enJSON = JSON.stringify(translations.en, null, 2);
      const frJSON = JSON.stringify(translations.fr, null, 2);
      const arJSON = JSON.stringify(translations.ar, null, 2);

      // For a real implementation, here we would call an API endpoint
      // that would save these files to disk
      console.log("Saving English translations:", enJSON);
      console.log("Saving French translations:", frJSON);
      console.log("Saving Arabic translations:", arJSON);

      // Update translations in the i18n instance
      i18n.addResourceBundle("en", "translation", translations.en, true, true);
      i18n.addResourceBundle("fr", "translation", translations.fr, true, true);
      i18n.addResourceBundle("ar", "translation", translations.ar, true, true);

      toast({
        title: t("settings.translation.saveSuccess"),
        description: t("settings.translation.saveSuccess"),
      });
    } catch (error) {
      console.error("Error saving translations:", error);
      toast({
        title: t("settings.translation.errorSaving"),
        description: t("settings.translation.errorSaving"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new translation
  const addNewTranslation = () => {
    if (!newTranslationKey) {
      toast({
        title: t("settings.translation.keyRequired"),
        description: t("settings.translation.keyRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      const path = newTranslationKey.split(".");

      // Update all language translations
      const updatedTranslations = {
        en: setNestedValue({ ...translations.en }, path, newTranslationValues.en),
        fr: setNestedValue({ ...translations.fr }, path, newTranslationValues.fr),
        ar: setNestedValue({ ...translations.ar }, path, newTranslationValues.ar),
      };

      setTranslations(updatedTranslations);

      // Clear form and close modal
      setNewTranslationKey("");
      setNewTranslationValues({
        en: "",
        fr: "",
        ar: "",
      });
      setIsModalOpen(false);

      toast({
        title: t("settings.translation.addSuccess"),
        description: t("settings.translation.addSuccess"),
      });
    } catch (error) {
      console.error("Error adding translation:", error);
      toast({
        title: t("settings.translation.errorAdding"),
        description: t("settings.translation.errorAdding"),
        variant: "destructive",
      });
    }
  };

  // Handle editing a translation
  const startEditTranslation = (path: string[]) => {
    setEditPath(path);

    // Get the current values for all languages
    const keyPath = path.join(".");
    setNewTranslationKey(keyPath);

    const en = getNestedValue(translations.en, path) as string;
    const fr = getNestedValue(translations.fr, path) as string;
    const ar = getNestedValue(translations.ar, path) as string;

    setNewTranslationValues({
      en: en || "",
      fr: fr || "",
      ar: ar || "",
    });

    setIsEditing(true);
    setIsModalOpen(true);
  };

  const updateTranslation = () => {
    try {
      // Update all language translations
      const updatedTranslations = {
        en: setNestedValue({ ...translations.en }, editPath, newTranslationValues.en),
        fr: setNestedValue({ ...translations.fr }, editPath, newTranslationValues.fr),
        ar: setNestedValue({ ...translations.ar }, editPath, newTranslationValues.ar),
      };

      setTranslations(updatedTranslations);

      // Clear form and close modal
      setEditPath([]);
      setNewTranslationKey("");
      setNewTranslationValues({
        en: "",
        fr: "",
        ar: "",
      });
      setIsEditing(false);
      setIsModalOpen(false);

      toast({
        title: t("settings.translation.updateSuccess"),
        description: t("settings.translation.updateSuccess"),
      });
    } catch (error) {
      console.error("Error updating translation:", error);
      toast({
        title: t("settings.translation.errorUpdating"),
        description: t("settings.translation.errorUpdating"),
        variant: "destructive",
      });
    }
  };

  // Handle deleting a translation
  const confirmDeleteTranslation = (path: string[]) => {
    setDeleteConfirmPath(path);
    setIsDeleting(true);
  };

  const deleteTranslation = () => {
    try {
      // Delete the translation from all languages
      const updatedTranslations = {
        en: deleteNestedValue({ ...translations.en }, deleteConfirmPath),
        fr: deleteNestedValue({ ...translations.fr }, deleteConfirmPath),
        ar: deleteNestedValue({ ...translations.ar }, deleteConfirmPath),
      };

      setTranslations(updatedTranslations);
      setIsDeleting(false);

      toast({
        title: t("settings.translation.deleteSuccess"),
        description: t("settings.translation.deleteSuccess"),
      });
    } catch (error) {
      console.error("Error deleting translation:", error);
      toast({
        title: t("settings.translation.errorDeleting"),
        description: t("settings.translation.errorDeleting"),
        variant: "destructive",
      });
    }
  };

  // Render a translation tree node
  const renderTreeNode = (path: string, depth = 0) => {
    const isLeaf = !hasChildren(path);
    const pathParts = path.split(".");
    const nodeName = pathParts[pathParts.length - 1];

    // If it's a leaf node, render the translation value
    if (isLeaf) {
      const value = getNestedValue(translations[activeLanguage], pathParts) as string;

      return (
        <div key={path} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-md" style={{ marginLeft: `${depth * 20}px` }}>
          <div className="flex items-center space-x-2 flex-grow">
            <div className="w-4" />
            <span className="font-medium">{nodeName}:</span>
            <span className="text-gray-700 flex-grow">{value}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => startEditTranslation(pathParts)} className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => confirmDeleteTranslation(pathParts)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      );
    }

    // If it's a branch node, render expandable section
    return (
      <div key={path}>
        <div
          className="flex items-center py-2 px-2 hover:bg-gray-50 rounded-md cursor-pointer"
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => toggleExpand(path)}
        >
          {isExpanded(path) ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          <span className="font-semibold">{nodeName}</span>
        </div>
        {isExpanded(path) && getDirectChildren(path).map((childPath) => renderTreeNode(childPath, depth + 1))}
      </div>
    );
  };

  // Render a flat list of filtered translations
  const renderSearchResults = () => {
    return filteredTranslations.map((item) => (
      <div key={item.key} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-md">
        <div className="flex flex-col flex-grow">
          <span className="font-medium text-sm text-gray-500">{item.key}</span>
          <span className="text-gray-700">{item.value}</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => startEditTranslation(item.path)} className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => confirmDeleteTranslation(item.path)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("settings.translation.title")}</CardTitle>
              <CardDescription>{t("settings.translation.description")}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                {t("settings.translation.addNew")}
              </Button>
              <Button onClick={saveTranslations} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {t("settings.translation.saveChanges")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="en"
            value={activeLanguage}
            onValueChange={(value) => setActiveLanguage(value as "en" | "fr" | "ar")}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>

              <div className="relative w-[300px]">
                <Search className="h-4 w-4 absolute top-3 left-3 text-gray-500" />
                <Input
                  placeholder={t("settings.translation.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 absolute top-1 right-1" onClick={() => setSearchQuery("")}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="en" className="mt-0">
              <Card>
                <CardContent className="p-4">
                  <div className="max-h-[600px] overflow-y-auto space-y-1 py-2">
                    {searchQuery ? renderSearchResults() : getDirectChildren("").map((path) => renderTreeNode(path))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fr" className="mt-0">
              <Card>
                <CardContent className="p-4">
                  <div className="max-h-[600px] overflow-y-auto space-y-1 py-2">
                    {searchQuery ? renderSearchResults() : getDirectChildren("").map((path) => renderTreeNode(path))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ar" className="mt-0">
              <Card>
                <CardContent className="p-4">
                  <div className="max-h-[600px] overflow-y-auto space-y-1 py-2">
                    {searchQuery ? renderSearchResults() : getDirectChildren("").map((path) => renderTreeNode(path))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t p-4 flex justify-between">
          <div className="text-sm text-gray-500">
            {filteredTranslations.length} translation entries in {activeLanguage === "en" ? "English" : activeLanguage === "fr" ? "French" : "Arabic"}
          </div>
          <Button variant="outline" onClick={saveTranslations} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            {t("settings.translation.saveChanges")}
          </Button>
        </CardFooter>
      </Card>

      {/* Add/Edit Translation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? t("settings.translation.editTranslation") : t("settings.translation.addTranslation")}</DialogTitle>
            <DialogDescription>{isEditing ? t("settings.translation.editTranslation") : t("settings.translation.addTranslation")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">{t("settings.translation.translationKey")}</Label>
              <Input
                id="key"
                placeholder={t("settings.translation.keyPlaceholder")}
                value={newTranslationKey}
                onChange={(e) => setNewTranslationKey(e.target.value)}
                disabled={isEditing}
                className={isEditing ? "bg-gray-100" : ""}
              />
              <p className="text-sm text-gray-500">{t("settings.translation.keyHint")}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="en-value">{t("settings.translation.englishValue")}</Label>
                <Input
                  id="en-value"
                  placeholder="Submit"
                  value={newTranslationValues.en}
                  onChange={(e) => setNewTranslationValues({ ...newTranslationValues, en: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fr-value">{t("settings.translation.frenchValue")}</Label>
                <Input
                  id="fr-value"
                  placeholder="Soumettre"
                  value={newTranslationValues.fr}
                  onChange={(e) => setNewTranslationValues({ ...newTranslationValues, fr: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ar-value">{t("settings.translation.arabicValue")}</Label>
                <Input
                  id="ar-value"
                  placeholder="إرسال"
                  value={newTranslationValues.ar}
                  dir="rtl"
                  onChange={(e) => setNewTranslationValues({ ...newTranslationValues, ar: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("app.common.cancel")}
            </Button>
            <Button onClick={isEditing ? updateTranslation : addNewTranslation}>{isEditing ? t("app.common.save") : t("app.common.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("settings.translation.deleteTranslation")}</DialogTitle>
            <DialogDescription>{t("settings.translation.deleteConfirmation")}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm font-semibold">{deleteConfirmPath.join(".")}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              {t("app.common.cancel")}
            </Button>
            <Button variant="destructive" onClick={deleteTranslation}>
              {t("app.common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
