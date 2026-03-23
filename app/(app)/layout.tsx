"use client";
import AppSidebar from "@/components/shared/AppSidebar";
import { AuthRequire } from "@/components/shared/AuthRequire";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { House, Wallet, LayoutDashboard, ChartBarBig, Building, CalendarDays } from "lucide-react";
import "@/app/globals.css";
import "@/styles/components.css"

/**
 * Définition des rôles (id_profile) :
 *   1 = Owner          → accès total
 *   2 = Manager        → gestion opérationnelle (sans Finance)
 *   3 = Asst. Manager  → idem Manager (lecture seule sur certains modules)
 *   4 = Coach          → calendrier + studios (lecture)
 *   5 = Asst. Coach    → calendrier uniquement
 *   6 = Student        → portail étudiant (pas de sidebar admin)
 */
const ALL_SIDEBAR_ITEMS = [
  { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: [1, 2, 3],       subItems: [] },
  { name: "Studios",   url: "/studios",   icon: House,           roles: [1, 2, 3, 4],    subItems: [] },
  { name: "Calendar",  url: "/calendar",  icon: CalendarDays,    roles: [1, 2, 3, 4, 5], subItems: [] },
  { name: "Reports",   url: "/reports",   icon: ChartBarBig,     roles: [1, 2],           subItems: [] },
  { name: "Finance",   url: "/finance",   icon: Wallet,          roles: [1],              subItems: [] },
  { name: "Settings",  url: "/settings",  icon: Building,        roles: [1, 2],           subItems: [] },
];

const AppLayout = ({children }: { children: React.ReactNode }) => {
  const { userCred } = useAuth();

  // Filtrer les items selon le rôle de l'utilisateur connecté
  const idProfile = userCred?.id_profile ?? -1;
  const sidebarItems = ALL_SIDEBAR_ITEMS.filter(item => item.roles.includes(idProfile));

  const shouldShowConfigMessage =
    userCred?.id_profile === 1 && userCred?.id_organization == null;

  const organization = { name: "Dojang Studio" };

  return (
    <main className="flex h-full w-full bg-[#f8f6f6]">
      <AuthRequire>
        <SidebarProvider
          defaultOpen={true}
          >
            <AppSidebar
              sidebarItems={sidebarItems}
              organization={organization}
            />
            <SidebarTrigger className="cursor-pointer" />
            <div className="flex w-full flex-col">
              {shouldShowConfigMessage && (
                <div className="mx-4 mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  <Link href="/organization" className="underline hover:no-underline">
                    configure your organization to start
                  </Link>
                </div>
              )}
              {children}
            </div>
        </SidebarProvider>
      </AuthRequire>
    </main>
  );
}
export default AppLayout;