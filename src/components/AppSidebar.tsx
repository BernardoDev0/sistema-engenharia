// src/components/AppSidebar.tsx

import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import {
  LayoutDashboard,
  HardHat,
  Package,
  BarChart2,
  FileText,
  ShieldCheck,
  Users as UsersIcon,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Painel", to: "/dashboard", icon: LayoutDashboard },
  { label: "Equipamentos", to: "/equipment", icon: HardHat },
  { label: "Meus equipamentos", to: "/my-equipment", icon: Package },
  {
    label: "Visão executiva",
    to: "/executive-dashboard",
    icon: BarChart2,
    roles: ["ADMIN", "OPERATIONS_MANAGER", "COMPLIANCE_ESG"],
  },
  {
    label: "Relatórios ESG",
    to: "/esg-reports",
    icon: FileText,
    roles: ["ADMIN", "OPERATIONS_MANAGER", "COMPLIANCE_ESG"],
  },
  {
    label: "Log de auditoria",
    to: "/audit-log",
    icon: ShieldCheck,
    roles: ["ADMIN", "COMPLIANCE_ESG"],
  },
  {
    label: "Usuários",
    to: "/users",
    icon: UsersIcon,
    roles: ["ADMIN"],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { roles, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const canAccess = (item: NavItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((r) => roles.includes(r as any));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="pb-1">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/20" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/60">
              Plataforma
            </span>
            <span className="text-sm font-semibold">ESG Equipment</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.filter(canAccess).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="hover-scale"
                    >
                      <NavLink
                        to={item.to}
                        end
                        className="flex items-center gap-2"
                        activeClassName=""
                      >
                        <Icon className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto space-y-2 border-t border-sidebar-border pt-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors hover-scale"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="group-data-[collapsible=icon]:hidden">
            {theme === "dark" ? "Modo claro" : "Modo escuro"}
          </span>
        </button>

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/15 hover:text-destructive-foreground transition-colors hover-scale"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
