"use client";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { House, Wallet, Store, ChartBarBig, Building } from "lucide-react";
import "@/app/globals.css";
import "@/styles/components.css"

const sidebarItems = [
  { name: "Dashboard", url: "/dashboard", icon: House, subItems: [] },
  // { name: "Reports", url: "/dashboard/reports", icon: ChartBarBig, subItems: [] },
  // { name: "Studios", url: "/dashboard/studios", icon: Store, subItems: [] },
  // { name: "Finances", url: "/dashboard/finances", icon: Wallet, subItems: [] },
  // { name: "Organization", url: "/dashboard/organization", icon: Building, subItems: [] },
];

const DashboardLayout = ({children }: { children: React.ReactNode }) => {
  const { userCred } = useAuth();

  const shouldShowConfigMessage =
    userCred?.id_profile === 1 && userCred?.id_organization == null;

  const organization = { name: "Dojang Studio" };

  return (
    <main className="flex h-full w-full bg-[#f8f6f6]">
      <RequireAuth>
        <SidebarProvider
          defaultOpen={true}
          >
            <DashboardSidebar
              sidebarItems={sidebarItems}
              organization={organization}
            />
            <SidebarTrigger className="cursor-pointer" />
            <div className="flex w-full flex-col">
              {shouldShowConfigMessage && (
                <div className="mx-4 mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  <Link href="/dashboard/organization" className="underline hover:no-underline">
                    configure your organization to start
                  </Link>
                </div>
              )}
              {children}
            </div>
        </SidebarProvider>
      </RequireAuth>
    </main>
  );
}
export default DashboardLayout;