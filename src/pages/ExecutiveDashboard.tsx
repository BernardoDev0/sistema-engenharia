// src/pages/ExecutiveDashboard.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { listActiveLoansUseCase } from "@/app/composition/loan";
import { listESGMetricsUseCase } from "@/app/composition/analytics";
import { supabase } from "@/integrations/supabase/client";

interface StockOverview {
  totalQuantity: number;
  inUse: number;
  available: number;
}

const fetchStockOverview = async (): Promise<StockOverview> => {
  const { data, error } = await supabase
    .from("equipment")
    .select("total_quantity,quantity_in_use");

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const totalQuantity = rows.reduce((sum, row: any) => sum + (row.total_quantity ?? 0), 0);
  const inUse = rows.reduce((sum, row: any) => sum + (row.quantity_in_use ?? 0), 0);

  return {
    totalQuantity,
    inUse,
    available: totalQuantity - inUse,
  };
};

const ExecutiveDashboardContent = () => {
  const { roles, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Executive Dashboard | Equipment ESG";
  }, []);

  const { data: stockOverview } = useQuery({
    queryKey: ["stock-overview"],
    queryFn: fetchStockOverview,
  });

  const { data: activeLoans } = useQuery({
    queryKey: ["active-loans"],
    queryFn: async () => {
      const result = await listActiveLoansUseCase.execute();
      return result.loans;
    },
  });

  const { data: esgMetrics } = useQuery({
    queryKey: ["esg-metrics-dashboard"],
    queryFn: async () => {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const endOfYear = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59));
      const result = await listESGMetricsUseCase.execute({
        from: startOfYear,
        to: endOfYear,
        granularity: "month",
      });
      return result.metrics;
    },
  });

  const isExecutive = roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER") || roles.includes("COMPLIANCE_ESG");

  if (!isExecutive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md bg-background/60 backdrop-blur-xl border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Access restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The executive dashboard is only available to admin, operations and compliance roles.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const esgChartData = (esgMetrics ?? [])
    .filter((m) => m.type === "INCIDENT_RATE")
    .map((m) => ({ period: m.period, value: m.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/60">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold tracking-tight">Executive Overview</h1>
            <nav className="flex gap-2 text-sm">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/equipment")}>
                Equipment
              </Button>
              <Button variant="ghost" onClick={() => navigate("/esg-reports")}>
                ESG Reports
              </Button>
              {(roles.includes("ADMIN") || roles.includes("COMPLIANCE_ESG")) && (
                <Button variant="ghost" onClick={() => navigate("/audit-log")}>
                  Audit Log
                </Button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-wide">
              Executive
            </Badge>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {stockOverview ? stockOverview.totalQuantity : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">All equipment units in the fleet</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{activeLoans ? activeLoans.length : "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Items currently checked out in the field</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {stockOverview ? stockOverview.available : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ready-to-deploy units</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-stretch">
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Incident rate over time</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {esgChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  No ESG data available yet. Metrics will appear as real loans and returns accumulate.
                </div>
              ) : (
                <ChartContainer
                  config={{
                    incident: {
                      label: "Incident rate",
                      color: "hsl(var(--destructive))",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer>
                    <BarChart data={esgChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="period" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="value" name="Incident rate" fill="var(--color-incident, hsl(var(--destructive)))" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The executive dashboard surfaces live operational and ESG indicators based purely on real
                equipment loans and returns.
              </p>
              <p>
                As more equipment circulates and damage incidents are reported, this view will reveal reuse
                intensity, waste reduction and safety trends.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

const ExecutiveDashboard = () => (
  <ProtectedRoute>
    <ExecutiveDashboardContent />
  </ProtectedRoute>
);

export default ExecutiveDashboard;
