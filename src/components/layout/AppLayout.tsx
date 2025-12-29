// src/components/layout/AppLayout.tsx

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen w-full bg-background text-foreground flex">
        <AppSidebar />
        <SidebarInset className="animate-fade-in">
          <header className="flex h-12 items-center border-b border-border bg-card/80 px-4 backdrop-blur">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-sm font-semibold tracking-[0.16em] uppercase text-muted-foreground">
              Painel ESG de Equipamentos
            </h1>
          </header>
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
