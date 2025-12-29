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
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_0_40px_rgba(15,23,42,0.7)]"
    >
      <SidebarHeader className="pb-1">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.7)]" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[10px] uppercase tracking-[0.24em] text-sidebar-foreground/60">
              Plataforma ESG
            </span>
            <span className="text-sm font-semibold">Equipment Control</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleGroups.map((group) => {
                const Icon = group.icon;
                const active = isGroupActive(group);
                const hasChildren = !!group.children?.length;
                const isOpen = openGroups[group.id] ?? true;

                return (
                  <SidebarMenuItem key={group.id}>
                    <div className="flex items-center gap-1">
                      <SidebarMenuButton
                        asChild={!!group.to}
                        isActive={active}
                        tooltip={group.label}
                        className="flex-1 hover-scale data-[active=true]:shadow-[0_0_0_1px_hsl(var(--sidebar-ring))] data-[active=true]:bg-sidebar-accent/70"
                      >
                        {group.to ? (
                          <NavLink to={group.to} end className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
                          </NavLink>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
                          </div>
                        )}
                      </SidebarMenuButton>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(group.id)}
                          className="group-data-[collapsible=icon]:hidden inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ml-1"
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
                      <SidebarMenuSub>
                        {group.children!.filter((child) => canAccess(child.roles)).map((child) => {
                          const childActive = isActivePath(child.to);
                          const key = `${group.id}-${child.to}-${child.label}`;
                          return (
                            <li key={key}>
                              <SidebarMenuSubButton
                                asChild
                                size="sm"
                                isActive={childActive}
                                className="hover-scale data-[active=true]:shadow-[0_0_0_1px_hsl(var(--sidebar-ring))]"
                              >
                                <NavLink to={child.to} end className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-sidebar-foreground/60" />
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
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors hover-scale"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="group-data-[collapsible=icon]:hidden">
            {theme === "dark" ? "Modo claro" : "Modo escuro"}
          </span>
        </button>

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/20 hover:text-destructive-foreground transition-colors hover-scale"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
