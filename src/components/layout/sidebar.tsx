"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useTotalUnread } from "@/hooks/use-total-unread";
import { FlowLogo } from "@/components/layout/flow-logo";
import { ContactAvatar } from "@/components/ui/contact-avatar";
import {
  Activity,
  CreditCard,
  Crown,
  GitBranch,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  LayoutGrid,
  Radio,
  Settings,
  Shield,
  TrendingUp,
  User,
  UserCog,
  Users,
  UsersRound,
  Workflow,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Sparkles,
  FileText,
} from "lucide-react";


import type { AccountRole } from "@/lib/auth/roles";
import { useState } from "react";


// Per-role chip metadata used in the sidebar's account strip + the
// Members tab roster. Keeping this near both consumers in a single
// place avoids drift between the two surfaces — when a designer
// wants to recolour "agent" rows, this is the one diff.
const ROLE_CHIP: Record<
  AccountRole,
  { icon: typeof Crown; labelKey: string; className: string }
> = {
  owner: {
    icon: Crown,
    labelKey: "roles.owner",
    // Amber: scarce, immutable, "the boss" — gets visual emphasis.
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5",
  },
  admin: {
    icon: Shield,
    labelKey: "roles.admin",
    // Primary-tinted: significant but not as scarce as owner.
    className:
      "border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5",
  },
  agent: {
    icon: UserCog,
    labelKey: "roles.agent",
    // Neutral slate: the operational default.
    className:
      "border-border bg-muted/60 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5",
  },
  viewer: {
    icon: User,
    labelKey: "roles.viewer",
    // Muted slate: read-only role; visually quieter than agent.
    className:
      "border-border/60 bg-card text-muted-foreground/80 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5",
  },
};
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "navigation.dashboard", icon: LayoutDashboard },
  { href: "/inbox", labelKey: "navigation.inbox", icon: MessageSquare },
  { href: "/boards", labelKey: "navigation.boards", icon: LayoutGrid },
  { href: "/contacts", labelKey: "navigation.contacts", icon: Users },
  { href: "/pipelines", labelKey: "navigation.pipelines", icon: GitBranch },
  { href: "/broadcasts", labelKey: "navigation.broadcasts", icon: Radio },
  { href: "/automations", labelKey: "navigation.automations", icon: Zap },
  { href: "/processes/document-delivery", labelKey: "navigation.documentDelivery", icon: FileText },
  { href: "/flows", labelKey: "navigation.flows", icon: Workflow },
  { href: "/ai-assistant", labelKey: "navigation.aiAssistant", icon: Sparkles },
];

const bottomNavItems = [
  { href: "/faq", labelKey: "navigation.faq", icon: HelpCircle },
  { href: "/settings", labelKey: "navigation.settings", icon: Settings },
];

interface SidebarProps {
  /** Controlled on mobile by the Header's hamburger button. Ignored on lg+. */
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { profile, profileLoading, account, accountRole, isSuperAdmin, signOut } = useAuth();
  const totalUnread = useTotalUnread();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("flowhub:sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("flowhub:sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  const showAccountStrip =
    !profileLoading &&
    !!account?.name &&
    account.name !== profile?.full_name;

  useEffect(() => {
    onClose?.();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label={t("navigation.closeMenu")}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-background/70 backdrop-blur-sm transition-opacity lg:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-border bg-card",
          "transition-all duration-300 ease-in-out will-change-[width,transform]",
          open ? "translate-x-0 w-64" : "-translate-x-full w-64",
          "lg:static lg:z-0 lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-60"
        )}
        aria-label="Primary"
      >
        {/* Logo row + Collapse toggle */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3.5">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <FlowLogo height={36} />
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expandir menu" : "Recolher menu"}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("navigation.closeMenu")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-none">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              const showUnreadDot =
                item.href === "/inbox" && totalUnread > 0 && !isActive;

              return (
                <li key={item.href}>
                  <Link
                    id={`tour-nav-${item.href.replace("/", "")}`}
                    href={item.href}
                    title={isCollapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="flex-1 truncate">{t(item.labelKey)}</span>}
                    {showUnreadDot && (
                      <span
                        aria-label={`${totalUnread} unread conversation${totalUnread === 1 ? "" : "s"}`}
                        className={cn("relative flex h-2 w-2", isCollapsed && "absolute top-1 right-1")}
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-3 border-t border-border" />

          <ul className="flex flex-col gap-1">
            {bottomNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    id={`tour-nav-${item.href.replace("/", "")}`}
                    href={item.href}
                    title={isCollapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  </Link>
                </li>
              );
            })}

            <li>
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  window.dispatchEvent(new CustomEvent("flowhub:open-support"));
                }}
                title={isCollapsed ? t("navigation.liveSupport") : undefined}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                )}
              >
                <Headphones className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{t("navigation.liveSupport")}</span>}
              </button>
            </li>

            {isSuperAdmin && (
              <>
                <li>
                  <Link
                    href="/admin/support"
                    title={isCollapsed ? t("navigation.adminSupport") : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      pathname.startsWith("/admin/support")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Headphones className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t("navigation.adminSupport")}</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/plans"
                    title={isCollapsed ? t("navigation.adminPlans") : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      pathname.startsWith("/admin/plans")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <CreditCard className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t("navigation.adminPlans")}</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/analytics"
                    title={isCollapsed ? t("navigation.adminAnalytics") : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      pathname.startsWith("/admin/analytics")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t("navigation.adminAnalytics")}</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/consumption"
                    title={isCollapsed ? t("navigation.adminConsumption") : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      pathname.startsWith("/admin/consumption")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Zap className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t("navigation.adminConsumption")}</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/onboarding-analytics"
                    title={isCollapsed ? t("navigation.adminOnboarding") : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      pathname.startsWith("/admin/onboarding-analytics")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Sparkles className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t("navigation.adminOnboarding")}</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/meta-platform"
                    title={isCollapsed ? t("navigation.adminMetaPlatform") : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      pathname.startsWith("/admin/meta-platform")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Activity className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t("navigation.adminMetaPlatform")}</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/super-admins"
                    title={isCollapsed ? "Operadores (Super Admin)" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      pathname.startsWith("/admin/super-admins")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <UserCog className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Operadores (Super Admin)</span>}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* User section */}
        <div className="shrink-0 border-t border-border p-2">
          {!isCollapsed && showAccountStrip && account?.name ? (
            <div className="mb-2 flex items-center gap-2 px-3 text-xs text-muted-foreground">
              <UsersRound className="size-3.5 shrink-0" />
              <span className="truncate" title={account.name}>
                {account.name}
              </span>
              {accountRole ? (
                (() => {
                  const meta = ROLE_CHIP[accountRole];
                  const Icon = meta.icon;
                  return (
                    <span
                      className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${meta.className}`}
                    >
                      <Icon className="size-3" />
                      {t(meta.labelKey)}
                    </span>
                  );
                })()
              ) : null}
            </div>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex w-full items-center gap-3 rounded-lg text-left transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none data-popup-open:bg-muted/60",
                isCollapsed ? "justify-center py-2 px-1" : "px-3 py-2"
              )}
            >
              <ContactAvatar
                name={profile?.full_name || profile?.email}
                avatarUrl={profile?.avatar_url}
                size="default"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {profile?.full_name ?? "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile?.email ?? ""}
                  </p>
                </div>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={6}
              className="min-w-56 bg-popover text-popover-foreground ring-border"
            >
              <DropdownMenuItem
                render={
                  <Link
                    href="/settings?tab=profile"
                    onClick={onClose}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                  />
                }
              >
                <User className="size-4" />
                {t("navigation.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href="/settings?tab=whatsapp"
                    onClick={onClose}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                  />
                }
              >
                <Settings className="size-4" />
                {t("navigation.settings")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onClose?.();
                  window.dispatchEvent(new CustomEvent("flowhub:open-support"));
                }}
                className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
              >
                <Headphones className="size-4" />
                {t("navigation.liveSupport")}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={signOut}
                className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <LogOut className="size-4" />
                {t("navigation.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
