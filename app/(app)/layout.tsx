"use client";
import AppSidebar from "@/components/shared/AppSidebar";
import { AuthRequire } from "@/components/shared/AuthRequire";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { House, Wallet, LayoutDashboard, ChartBarBig, Building } from "lucide-react";
import "@/app/globals.css";
import "@/styles/components.css"

const sidebarItems = [
  { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard, subItems: [] },
  { name: "Studios", url: "/studios", icon: House, subItems: [] },
  { name: "Reports", url: "/reports", icon: ChartBarBig, subItems: [] },
  { name: "Finance", url: "/finance", icon: Wallet, subItems: [] },
  { name: "Settings", url: "/settings", icon: Building, subItems: [] },
];

const AppLayout = ({children }: { children: React.ReactNode }) => {
  const { userCred } = useAuth();

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
                  <Link href="/dashboard/organization" className="underline hover:no-underline">
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