import {
  LayoutDashboard,
  ListChecks,
  Layers,
  ClipboardList,
  Building2,
  Users,
  Bell,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-tasks", label: "Meine Aufgaben", icon: ListChecks },
  { href: "/topics", label: "Themen", icon: Layers },
  { href: "/tasks", label: "Aufgaben", icon: ClipboardList },
  { href: "/departments", label: "Abteilungen", icon: Building2 },
  { href: "/people", label: "Personen", icon: Users },
  { href: "/notifications", label: "Benachrichtigungen", icon: Bell },
  { href: "/admin", label: "Administration", icon: ShieldCheck, adminOnly: true },
];
