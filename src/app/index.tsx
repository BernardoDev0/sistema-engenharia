import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Equipment from "@/pages/Equipment";
import EquipmentDetail from "@/pages/EquipmentDetail";
import MyEquipment from "@/pages/MyEquipment";
import ExecutiveDashboard from "@/pages/ExecutiveDashboard";
import ESGReports from "@/pages/ESGReports";
import AuditLog from "@/pages/AuditLog";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export const AppRoot = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/my-equipment" element={<MyEquipment />} />
            <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
            <Route path="/esg-reports" element={<ESGReports />} />
            <Route path="/audit-log" element={<AuditLog />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AppRoot;
