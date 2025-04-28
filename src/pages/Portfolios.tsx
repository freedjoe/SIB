import { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { usePortfoliosRealtime, usePortfolioMutation } from "@/hooks/useSupabaseData";

interface PortfolioFormData {
  name: string;
  description?: string;
}

export default function Portfolios() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [currentPortfolio, setCurrentPortfolio] = useState<PortfolioFormData>({
    name: "",
    description: "",
  });

  // Use realtime hook for data
  const { data: portfolios = [], isLoading, error } = usePortfoliosRealtime();

  // Use mutation hook for CRUD operations
  const portfolioMutation = usePortfolioMutation({
    onSuccess: () => {
      setIsDialogOpen(false);
      toast({
        title: dialogMode === "add" ? "Portfolio created" : "Portfolio updated",
        description: "The portfolio has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <Dashboard>
        <DashboardHeader>
          <h2>Portfolios</h2>
        </DashboardHeader>
        <div>Loading...</div>
      </Dashboard>
    );
  }

  // Error state
  if (error) {
    return (
      <Dashboard>
        <DashboardHeader>
          <h2>Portfolios</h2>
        </DashboardHeader>
        <div>Error loading portfolios</div>
      </Dashboard>
    );
  }

  // Filter portfolios based on search
  const filteredPortfolios = portfolios.filter(
    (portfolio) =>
      portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) || portfolio.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSavePortfolio = async () => {
    if (!currentPortfolio.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a portfolio name.",
        variant: "destructive",
      });
      return;
    }

    if (dialogMode === "add") {
      portfolioMutation.mutate({
        type: "INSERT",
        data: currentPortfolio,
      });
    } else {
      portfolioMutation.mutate({
        type: "UPDATE",
        id: (currentPortfolio as any).id,
        data: currentPortfolio,
      });
    }
  };

  const handleEditPortfolio = (portfolio: any) => {
    setCurrentPortfolio(portfolio);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDeletePortfolio = async (id: string) => {
    if (confirm("Are you sure you want to delete this portfolio?")) {
      portfolioMutation.mutate({
        type: "DELETE",
        id,
      });
    }
  };

  return (
    <Dashboard>
      <DashboardHeader>
        <h2>Portfolios</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input placeholder="Search portfolios..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button
            onClick={() => {
              setCurrentPortfolio({ name: "", description: "" });
              setDialogMode("add");
              setIsDialogOpen(true);
            }}
          >
            Add Portfolio
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPortfolios.map((portfolio) => (
          <Card key={portfolio.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{portfolio.name}</h3>
              <p className="text-sm text-gray-500">{portfolio.description}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditPortfolio(portfolio)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeletePortfolio(portfolio.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add New Portfolio" : "Edit Portfolio"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={currentPortfolio.name} onChange={(e) => setCurrentPortfolio((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentPortfolio.description}
                onChange={(e) => setCurrentPortfolio((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePortfolio} disabled={portfolioMutation.isPending}>
              {portfolioMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
