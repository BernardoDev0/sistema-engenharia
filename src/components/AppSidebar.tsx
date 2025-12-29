// src/components/AppSidebar.tsx

import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import {
  LayoutDashboard,
  HardHat,
  Package,
  ShieldCheck,
  Users as UsersIcon,
  LogOut,
  Moon,
  Sun,
  FileText,
  BarChart2,
  ChevronRight,
} from "lucide-react";

interface NavChildItem {
  label: string;
  to: string;
  roles?: string[];
}

interface NavGroup {
  id: string;
  label: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: NavChildItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "equipment",
    label: "Equipamentos",
    to: "/equipment",
    icon: HardHat,
    children: [
      { label: "Inventário", to: "/equipment" },
      { label: "Empréstimos", to: "/my-equipment" },
      { label: "Manutenção", to: "/equipment" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: ShieldCheck,
    roles: ["ADMIN", "OPERATIONS_MANAGER", "COMPLIANCE_ESG"],
    children: [
      { label: "Relatórios ESG", to: "/esg-reports" },
      { label: "Log de auditoria", to: "/audit-log", roles: ["ADMIN", "COMPLIANCE_ESG"] },
    ],
  },
  {
    id: "admin",
    label: "Administração",
    icon: UsersIcon,
    roles: ["ADMIN"],
    children: [
      { label: "Usuários", to: "/users" },
      // "Papéis" navega para Usuários, onde os papéis são geridos
      { label: "Papéis", to: "/users" },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { roles, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state: sidebarState } = useSidebar();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    equipment: true,
    compliance: true,
    admin: true,
  });

  const canAccess = (rolesRequired?: string[]) => {
    if (!rolesRequired || rolesRequired.length === 0) return true;
    return rolesRequired.some((r) => roles.includes(r as any));
  };

  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS.filter((group) => {
        if (!canAccess(group.roles)) return false;
        if (!group.children) return true;
        return group.children.some((child) => canAccess(child.roles));
      }),
    [roles],
  );

  const isActivePath = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isGroupActive = (group: NavGroup) => {
    if (group.to && isActivePath(group.to)) return true;
    if (group.children) {
      return group.children.some((child) => isActivePath(child.to));
    }
    return false;
  };

  const handleToggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-background/80 text-sidebar-foreground">
      <div className="flex h-full flex-col gap-4 px-3 py-4 font-sans">
        <SidebarHeader className="pb-0">
          <div className="flex items-center gap-3 rounded-2xl bg-card/80 px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sidebar-primary/10 text-sidebar-primary">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-sidebar-foreground/60">
                Plataforma ESG
              </span>
              <span className="text-sm font-semibold">Equipment Control</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {visibleGroups.map((group) => {
                  const Icon = group.icon;
                  const active = isGroupActive(group);
                  const hasChildren = !!group.children?.length;
                  const isOpen = openGroups[group.id] ?? true;

                  return (
                    <SidebarMenuItem key={group.id} className="mt-0">
                      <div className="flex items-center gap-1">
                        <SidebarMenuButton
                          asChild={!!group.to}
                          isActive={active}
                          tooltip={group.label}
                          className="flex-1 rounded-2xl bg-transparent px-3 py-2 text-[13px] font-medium data-[active=true]:bg-card data-[active=true]:shadow-md data-[active=true]:text-foreground hover:bg-card/80 hover:shadow-sm transition-all"
                        >
                          {group.to ? (
                            <NavLink to={group.to} end className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sidebar-primary/5 text-sidebar-primary">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="group-data-[collapsible=icon]:hidden">
                                {group.label}
                              </span>
                            </NavLink>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sidebar-primary/5 text-sidebar-primary">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="group-data-[collapsible=icon]:hidden">
                                {group.label}
                              </span>
                            </div>
                          )}
                        </SidebarMenuButton>

                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => handleToggleGroup(group.id)}
                            className="group-data-[collapsible=icon]:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl text-sidebar-foreground/70 hover:bg-card/80 hover:text-sidebar-primary transition-colors ml-1"
                          >
                            <ChevronRight
                              className={`h-3.5 w-3.5 transform transition-transform duration-200 ${
                                isOpen ? "rotate-90" : "rotate-0"
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {hasChildren && isOpen && sidebarState !== "collapsed" && (
                        <SidebarMenuSub className="border-l-0 px-0 pl-4">
                          {group.children!.filter((child) => canAccess(child.roles)).map((child) => {
                            const childActive = isActivePath(child.to);
                            const key = `${group.id}-${child.to}-${child.label}`;
                            return (
                              <li key={key}>
                                <SidebarMenuSubButton
                                  asChild
                                  size="sm"
                                  isActive={childActive}
                                  className="hover-scale data-[active=true]:bg-card data-[active=true]:text-foreground rounded-xl px-3"
                                >
                                  <NavLink to={child.to} end className="flex items-center gap-2 text-[12px]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-sidebar-foreground/40" />
                                    <span>{child.label}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </li>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
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
            className="flex w-full items-center gap-2 rounded-2xl bg-card/60 px-3 py-2 text-[13px] text-sidebar-foreground/80 hover:bg-card hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="group-data-[collapsible=icon]:hidden">
              {theme === "dark" ? "Modo claro" : "Modo escuro"}
            </span>
          </button>

          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-2xl bg-destructive/5 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/15 hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Sair</span>
          </button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
