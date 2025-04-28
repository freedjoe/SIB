import { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { usePortfoliosRealtime, useProgramsRealtime, useProgramMutation } from "@/hooks/useSupabaseData";

interface ProgramFormData {
  name: string;
  description?: string;
  portfolio_id: string;
}

export default function Programs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [currentProgram, setCurrentProgram] = useState<ProgramFormData>({
    name: "",
    description: "",
    portfolio_id: "",
  });

  // Use realtime hooks for data
  const { data: portfolios = [], isLoading: loadingPortfolios, error: portfoliosError } = usePortfoliosRealtime();

  const { data: programs = [], isLoading: loadingPrograms, error: programsError } = useProgramsRealtime();

  // Use mutation hook for CRUD operations
  const programMutation = useProgramMutation({
    onSuccess: () => {
      setIsDialogOpen(false);
      toast({
        title: dialogMode === "add" ? "Program created" : "Program updated",
        description: "The program has been saved successfully.",
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
  if (loadingPortfolios || loadingPrograms) {
    return (
      <Dashboard>
        <DashboardHeader>
          <h2>Programs</h2>
        </DashboardHeader>
        <div>Loading...</div>
      </Dashboard>
    );
  }

  // Error state
  if (portfoliosError || programsError) {
    return (
      <Dashboard>
        <DashboardHeader>
          <h2>Programs</h2>
        </DashboardHeader>
        <div>Error loading data</div>
      </Dashboard>
    );
  }

  // Filter programs based on search and selected portfolio
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) || program.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPortfolio = selectedPortfolio === "all" || program.portfolio_id === selectedPortfolio;
    return matchesSearch && matchesPortfolio;
  });

  const handleSaveProgram = async () => {
    if (!currentProgram.name || !currentProgram.portfolio_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (dialogMode === "add") {
      programMutation.mutate({
        type: "INSERT",
        data: currentProgram,
      });
    } else {
      programMutation.mutate({
        type: "UPDATE",
        id: (currentProgram as any).id,
        data: currentProgram,
      });
    }
  };

  const handleEditProgram = (program: any) => {
    setCurrentProgram(program);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDeleteProgram = async (id: string) => {
    if (confirm("Are you sure you want to delete this program?")) {
      programMutation.mutate({
        type: "DELETE",
        id,
      });
    }
  };

  return (
    <Dashboard>
      <DashboardHeader>
        <h2>Programs</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input placeholder="Search programs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
            <SelectTrigger>
              <SelectValue placeholder="Select portfolio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Portfolios</SelectItem>
              {portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setCurrentProgram({ name: "", description: "", portfolio_id: "" });
              setDialogMode("add");
              setIsDialogOpen(true);
            }}
          >
            Add Program
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrograms.map((program) => (
          <Card key={program.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{program.name}</h3>
              <p className="text-sm text-gray-500">{program.description}</p>
              <div className="mt-2">
                <span className="text-sm text-blue-600">Portfolio: {portfolios.find((p) => p.id === program.portfolio_id)?.name}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditProgram(program)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteProgram(program.id)}>
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
            <DialogTitle>{dialogMode === "add" ? "Add New Program" : "Edit Program"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={currentProgram.name} onChange={(e) => setCurrentProgram((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentProgram.description}
                onChange={(e) => setCurrentProgram((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="portfolio">Portfolio</Label>
              <Select value={currentProgram.portfolio_id} onValueChange={(value) => setCurrentProgram((prev) => ({ ...prev, portfolio_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProgram} disabled={programMutation.isPending}>
              {programMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
