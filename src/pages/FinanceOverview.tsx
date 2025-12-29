// src/pages/FinanceOverview.tsx

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FinanceFacade } from "@/presentation/finance/FinanceFacade";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

const financeFacade = new FinanceFacade();

const FinanceOverviewContent = () => {
  const { roles } = useAuth();

  useEffect(() => {
    document.title = "Visão Financeira - Financeiro & Contratos";
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["finance", "overview"],
    queryFn: () => financeFacade.getFinancialOverview(),
  });

  const canManage = roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER");

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Visão Financeira</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Panorama executivo de contratos, despesas e faturas ligadas a operações ambientais. Todos os valores são
            calculados em tempo real a partir de registros existentes — nenhum dado fictício é gerado.
          </p>
        </header>

        {isLoading || !data ? (
          <p className="text-sm text-muted-foreground">Carregando visão financeira...</p>
        ) : (
          <section className="grid gap-4 md:grid-cols-3">
            <OverviewCard title="Valor contratado" data={data.contractsTotalByCurrency} tone="primary" />
            <OverviewCard title="Despesas recentes" data={data.expensesTotalByCurrency} tone="muted" />
            <OverviewCard title="Faturas em aberto" data={data.openInvoicesTotalByCurrency} tone="destructive" />
          </section>
        )}

        {!canManage && (
          <p className="text-[11px] text-muted-foreground max-w-xl">
            Esta visão é somente leitura para perfis não financeiros. As permissões de lançamento e edição são
            restritas às funções administrativas e de gestão de operações.
          </p>
        )}
      </main>
    </div>
  );
};

const OverviewCard = ({
  title,
  data,
  tone,
}: {
  title: string;
  data: Record<string, number>;
  tone: "primary" | "muted" | "destructive";
}) => {
  const entries = Object.entries(data);

  return (
    <article className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <Badge
          variant={tone === "primary" ? "secondary" : tone === "destructive" ? "destructive" : "outline"}
          className="text-[11px]"
        >
          Financeiro
        </Badge>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhum registro financeiro disponível nesta categoria ainda.
        </p>
      ) : (
        <ul className="space-y-1 text-sm">
          {entries.map(([currency, total]) => (
            <li key={currency} className="flex items-center justify-between text-xs">
              <span className="uppercase text-muted-foreground">{currency}</span>
              <span className="font-medium">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

const FinanceOverview = () => {
  return <FinanceOverviewContent />;
};

export default FinanceOverview;
