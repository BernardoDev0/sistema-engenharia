// src/pages/FinanceSuppliers.tsx

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FinanceFacade } from "@/presentation/finance/FinanceFacade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const createSupplierSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(255),
  serviceType: z.enum(["EQUIPMENT", "MAINTENANCE", "WASTE_DISPOSAL", "CONSULTING"]),
  contactInfo: z.string().trim().max(500).optional(),
  certifications: z.string().trim().max(500).optional(),
});

const financeFacade = new FinanceFacade();

const FinanceSuppliersContent = () => {
  const { roles } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Fornecedores - Financeiro & Contratos";
  }, []);

  const canManage = roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER");

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["finance", "suppliers"],
    queryFn: () => financeFacade.listSuppliers(),
  });

  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof createSupplierSchema>) => financeFacade.createSupplier(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "suppliers"] });
      toast({ title: "Fornecedor criado", description: "O fornecedor foi cadastrado com sucesso." });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar fornecedor",
        description: error?.message ?? "Não foi possível criar o fornecedor.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-background">
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
            <p className="text-sm text-muted-foreground">
              Cadastro de fornecedores estratégicos de engenharia ambiental.
            </p>
          </div>
          {canManage && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">Novo fornecedor</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo fornecedor</DialogTitle>
                  <DialogDescription>
                    Cadastre fornecedores reais utilizados pela operação. Nenhum dado fictício é gerado.
                  </DialogDescription>
                </DialogHeader>
                <SupplierForm
                  isSubmitting={createMutation.isPending}
                  onSubmit={(values) => createMutation.mutate(values)}
                />
              </DialogContent>
            </Dialog>
          )}
        </header>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando fornecedores...</p>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <p className="text-sm font-medium">Nenhum fornecedor cadastrado.</p>
              {canManage && (
                <p className="text-xs text-muted-foreground max-w-md">
                  Comece cadastrando os fornecedores de equipamentos, manutenção, destinação de resíduos e consultoria que
                  sua equipe realmente utiliza.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo de serviço</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Certificações</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.serviceType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {s.contactInfo || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {s.certifications || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "ACTIVE" ? "secondary" : "outline"}>
                        {s.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>
    </div>
  );
};

const SupplierForm = ({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createSupplierSchema>) => void;
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const raw = {
      name: String(formData.get("name") ?? ""),
      serviceType: String(formData.get("serviceType") ?? "EQUIPMENT"),
      contactInfo: String(formData.get("contactInfo") ?? ""),
      certifications: String(formData.get("certifications") ?? ""),
    };

    const parsed = createSupplierSchema.safeParse({
      ...raw,
      contactInfo: raw.contactInfo || undefined,
      certifications: raw.certifications || undefined,
    });

    if (!parsed.success) {
      // For a real system we would surface field-level errors; keep minimal for now.
      return;
    }

    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" placeholder="Fornecedor Ambiental Ltda." required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="serviceType">Tipo de serviço</Label>
        <Select name="serviceType" defaultValue="EQUIPMENT">
          <SelectTrigger id="serviceType">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EQUIPMENT">Equipamentos</SelectItem>
            <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
            <SelectItem value="WASTE_DISPOSAL">Destinação de resíduos</SelectItem>
            <SelectItem value="CONSULTING">Consultoria</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactInfo">Contato</Label>
        <Input id="contactInfo" name="contactInfo" placeholder="contato@fornecedor.com | (11) 0000-0000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="certifications">Certificações</Label>
        <Input id="certifications" name="certifications" placeholder="ISO 14001, licenciamentos, etc." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar fornecedor"}
        </Button>
      </div>
    </form>
  );
};

const FinanceSuppliers = () => {
  return <FinanceSuppliersContent />;
};

export default FinanceSuppliers;
