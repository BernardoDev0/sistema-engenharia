// src/pages/FinanceContracts.tsx

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { FinanceFacade } from "@/presentation/finance/FinanceFacade";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const financeFacade = new FinanceFacade();

const FinanceContractsContent = () => {
  const { roles } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Contratos - Financeiro & Contratos";
  }, []);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["finance", "contracts"],
    queryFn: () => financeFacade.listContracts(),
  });

  const canManage = roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER");

  const selected = selectedIndex != null ? contracts[selectedIndex] : null;

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-background">
      <main className="container mx-auto px-4 py-8 grid gap-6 md:grid-cols-[2fr,1.2fr] animate-fade-in">
        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Contratos</h1>
              <p className="text-sm text-muted-foreground">
                Visão consolidada dos contratos firmados com fornecedores ambientais.
              </p>
            </div>
          </header>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando contratos...</p>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <p className="text-sm font-medium">Nenhum contrato cadastrado.</p>
              <p className="text-xs text-muted-foreground max-w-md">
                Cadastre contratos reais de prestação de serviços ambientais, vinculados a projetos e fornecedores.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract, index) => (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setSelectedIndex(index)}
                  >
                    <TableCell className="font-medium">
                      <span className="truncate max-w-xs inline-block align-middle">{contract.title}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{contract.supplierId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {contract.projectId ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: contract.currency,
                      }).format(contract.value)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {contract.startDate.toLocaleDateString()} – {contract.endDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contract.status === "ACTIVE"
                            ? "secondary"
                            : contract.status === "EXPIRED"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <aside className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Detalhes do contrato</h2>
          {!selected ? (
            <p className="text-xs text-muted-foreground">
              Selecione um contrato na lista para visualizar detalhes resumidos. Usuários não financeiros têm acesso de
              leitura conforme participação em projetos.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Título</p>
                <p className="font-medium">{selected.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fornecedor</p>
                <p className="font-mono text-xs">{selected.supplierId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Projeto vinculado</p>
                <p className="font-mono text-xs">{selected.projectId ?? "Sem vínculo explícito"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Valor contratado</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: selected.currency,
                    }).format(selected.value)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selected.status === "ACTIVE"
                        ? "secondary"
                        : selected.status === "EXPIRED"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {selected.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p>{selected.startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Término</p>
                  <p>{selected.endDate.toLocaleDateString()}</p>
                </div>
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Escopo resumido</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{selected.description}</p>
                </div>
              )}
              {!canManage && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Esta visualização é somente leitura. Alterações contratuais devem ser realizadas pela equipe
                  administrativa/operacional.
                </p>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

const FinanceContracts = () => {
  return <FinanceContractsContent />;
};

export default FinanceContracts;
