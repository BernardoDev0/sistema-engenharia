// src/pages/Equipment.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { EquipmentStatus } from "@/core/domain/equipment/Equipment";
import {
  listEquipmentUseCase,
  createEquipmentUseCase,
} from "@/app/composition/equipment";

const createEquipmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  category: z
    .string()
    .trim()
    .min(1, { message: "Category is required" })
    .max(100, { message: "Category must be less than 100 characters" }),
  certification: z
    .string()
    .trim()
    .max(100, { message: "Certification must be less than 100 characters" })
    .optional(),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "DISCARDED"]),
  totalQuantity: z
    .number()
    .int()
    .min(0, { message: "Total quantity must be non-negative" }),
});

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  certification: string | null;
  status: EquipmentStatus;
  totalQuantity: number;
  quantityInUse: number;
  quantityAvailable: number;
}

const EquipmentContent = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [certification, setCertification] = useState("");
  const [status, setStatus] = useState<EquipmentStatus>("AVAILABLE");
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signOut, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin = roles.includes("ADMIN");

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const result = await listEquipmentUseCase.execute();
      const items = result.equipment.map((eq) => ({
        id: eq.id,
        name: eq.name,
        category: eq.category,
        certification: eq.certification,
        status: eq.status,
        totalQuantity: eq.totalQuantity,
        quantityInUse: eq.quantityInUse,
        quantityAvailable: eq.quantityAvailable,
      }));
      setEquipment(items);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch equipment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createEquipmentSchema.safeParse({
      name,
      category,
      certification: certification || undefined,
      status,
      totalQuantity,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsCreating(true);

    try {
      await createEquipmentUseCase.execute({
        name,
        category,
        certification: certification || null,
        status,
        totalQuantity,
      });

      toast({
        title: "Success",
        description: "Equipment created successfully",
      });

      setIsCreateDialogOpen(false);
      setName("");
      setCategory("");
      setCertification("");
      setStatus("AVAILABLE");
      setTotalQuantity(0);

      await fetchEquipment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "IN_USE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DISCARDED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-background">
      {/* content handled below */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Inventário de equipamentos</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe e gerencie equipamentos em todas as localidades
            </p>
          </div>

          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Adicionar equipamento</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar novo equipamento</DialogTitle>
                  <DialogDescription>
                    Registre novos equipamentos no inventário do sistema.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateEquipment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do equipamento</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isCreating}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isCreating}
                      className={errors.category ? "border-destructive" : ""}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certification">Certificação (opcional)</Label>
                    <Input
                      id="certification"
                      type="text"
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      disabled={isCreating}
                      className={errors.certification ? "border-destructive" : ""}
                    />
                    {errors.certification && (
                      <p className="text-sm text-destructive">
                        {errors.certification}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value: EquipmentStatus) => setStatus(value)}
                      disabled={isCreating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Disponível</SelectItem>
                        <SelectItem value="IN_USE">Em uso</SelectItem>
                        <SelectItem value="MAINTENANCE">Em manutenção</SelectItem>
                        <SelectItem value="DISCARDED">Descartado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalQuantity">Quantidade total</Label>
                    <Input
                      id="totalQuantity"
                      type="number"
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(parseInt(e.target.value) || 0)}
                      disabled={isCreating}
                      className={errors.totalQuantity ? "border-destructive" : ""}
                    />
                    {errors.totalQuantity && (
                      <p className="text-sm text-destructive">
                        {errors.totalQuantity}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Criando..." : "Criar equipamento"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm text-muted-foreground">Carregando equipamentos...</p>
            </div>
          </div>
        ) : equipment.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Nenhum equipamento ainda</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {isAdmin
                  ? "Comece adicionando o primeiro equipamento ao inventário."
                  : "Nenhum equipamento foi cadastrado no sistema ainda. Fale com um administrador."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/equipment/${item.id}`)}
                className="cursor-pointer rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge className={getStatusColor(item.status)} variant="outline">
                      {item.status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Category: <span className="font-medium">{item.category}</span>
                    </p>
                    {item.certification && (
                      <p className="text-sm text-muted-foreground">
                        Cert: <span className="font-medium">{item.certification}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-semibold text-lg">
                        {item.quantityAvailable} / {item.totalQuantity}
                      </p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-muted-foreground">In Use</p>
                      <p className="font-semibold text-lg">{item.quantityInUse}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

const Equipment = () => {
  return (
    <ProtectedRoute>
      <AppLayout>
        <EquipmentContent />
      </AppLayout>
    </ProtectedRoute>
  );
};

export default Equipment;
