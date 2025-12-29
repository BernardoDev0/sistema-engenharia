// src/pages/EquipmentDetail.tsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { EquipmentStatus, EquipmentId } from "@/core/domain/equipment/Equipment";
import type { UserId } from "@/core/domain/identity/User";
import { getEquipmentByIdUseCase } from "@/app/composition/equipment";
import { createLoanUseCase } from "@/app/composition/loan";
import { ArrowLeft, Package } from "lucide-react";
import { z } from "zod";

const checkoutSchema = z.object({
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

interface EquipmentDetails {
  id: string;
  name: string;
  category: string;
  certification: string | null;
  status: EquipmentStatus;
  totalQuantity: number;
  quantityInUse: number;
  quantityAvailable: number;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentDetailContent = () => {
  const [equipment, setEquipment] = useState<EquipmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const { id } = useParams<{ id: string }>();
  const { user, signOut, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin = roles.includes("ADMIN");

  useEffect(() => {
    if (id) {
      fetchEquipmentDetails(id);
    }
  }, [id]);

  const fetchEquipmentDetails = async (equipmentId: string) => {
    setIsLoading(true);
    try {
      const result = await getEquipmentByIdUseCase.execute({
        id: equipmentId as EquipmentId,
      });

      setEquipment({
        id: result.equipment.id,
        name: result.equipment.name,
        category: result.equipment.category,
        certification: result.equipment.certification,
        status: result.equipment.status,
        totalQuantity: result.equipment.totalQuantity,
        quantityInUse: result.equipment.quantityInUse,
        quantityAvailable: result.equipment.quantityAvailable,
        createdAt: result.equipment.createdAt,
        updatedAt: result.equipment.updatedAt,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch equipment details",
        variant: "destructive",
      });
      navigate("/equipment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!equipment || !user) return;

    setCheckoutError("");

    const result = checkoutSchema.safeParse({ quantity: checkoutQuantity });
    if (!result.success) {
      setCheckoutError(result.error.issues[0].message);
      return;
    }

    if (checkoutQuantity > equipment.quantityAvailable) {
      setCheckoutError(`Only ${equipment.quantityAvailable} available`);
      return;
    }

    setIsCheckingOut(true);

    try {
      await createLoanUseCase.execute({
        userId: user.id as UserId,
        equipmentId: equipment.id as EquipmentId,
        quantity: checkoutQuantity,
      });

      toast({
        title: "Success",
        description: `Checked out ${checkoutQuantity} ${equipment.name}`,
      });

      setShowCheckoutDialog(false);
      setCheckoutQuantity(1);
      
      // Refresh equipment details
      await fetchEquipmentDetails(equipment.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to checkout equipment",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Detalhes do equipamento</h1>
            <nav className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Painel
              </Button>
              <Button variant="ghost" onClick={() => navigate("/equipment")}>
                Equipamentos
              </Button>
              <Button variant="ghost" onClick={() => navigate("/my-equipment")}>
                Meus equipamentos
              </Button>
              {isAdmin && (
                <Button variant="ghost" onClick={() => navigate("/users")}>
                  Usuários
                </Button>
              )}
            </nav>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/equipment")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para equipamentos
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm text-muted-foreground">Carregando equipamento...</p>
            </div>
          </div>
        ) : equipment ? (
          <div className="max-w-3xl space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-semibold mb-2">{equipment.name}</h2>
                  <p className="text-muted-foreground">
                    {equipment.category}
                    {equipment.certification && ` • ${equipment.certification}`}
                  </p>
                </div>
                <Badge className={getStatusColor(equipment.status)} variant="outline">
                  {equipment.status}
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Quantidade total</p>
                    <p className="text-2xl font-semibold">{equipment.totalQuantity}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Quantidade em uso</p>
                    <p className="text-2xl font-semibold">{equipment.quantityInUse}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Quantidade disponível
                    </p>
                    <p className="text-2xl font-semibold text-primary">
                      {equipment.quantityAvailable}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ID do equipamento</p>
                    <p className="font-mono text-sm">{equipment.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Criado em</p>
                    <p className="text-sm">
                      {new Date(equipment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Última atualização</p>
                    <p className="text-sm">
                      {new Date(equipment.updatedAt).toLocaleString()}
                    </p>
              </div>

              {equipment.quantityAvailable > 0 && equipment.status !== 'DISCARDED' && (
                <div className="mt-6">
                  <Button
                    onClick={() => setShowCheckoutDialog(true)}
                    className="w-full"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Retirar equipamento
                  </Button>
                </div>
              )}
            </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Availability Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Can be loaned out</span>
                  <Badge variant={equipment.quantityAvailable > 0 && equipment.status !== 'DISCARDED' ? "default" : "secondary"}>
                    {equipment.quantityAvailable > 0 && equipment.status !== 'DISCARDED' ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    Taxa de utilização
                  </span>
                  <span className="font-medium">
                    {equipment.totalQuantity > 0
                      ? Math.round(
                          (equipment.quantityInUse / equipment.totalQuantity) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Checkout Dialog */}
        <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Retirar equipamento</DialogTitle>
              <DialogDescription>
                Selecione a quantidade que deseja retirar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {equipment && (
                <>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="font-medium mb-1">{equipment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Available: {equipment.quantityAvailable} of {equipment.totalQuantity}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={equipment.quantityAvailable}
                      value={checkoutQuantity}
                      onChange={(e) => {
                        setCheckoutQuantity(parseInt(e.target.value) || 1);
                        setCheckoutError("");
                      }}
                      disabled={isCheckingOut}
                      className={checkoutError ? "border-destructive" : ""}
                    />
                    {checkoutError && (
                      <p className="text-sm text-destructive">{checkoutError}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckoutDialog(false)}
                  disabled={isCheckingOut}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCheckout} disabled={isCheckingOut}>
                  {isCheckingOut ? "Processando..." : "Confirmar retirada"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

const EquipmentDetail = () => {
  return (
    <ProtectedRoute>
      <EquipmentDetailContent />
    </ProtectedRoute>
  );
};

export default EquipmentDetail;
