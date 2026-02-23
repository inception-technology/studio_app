"use client";
import UserSidebar from "@/components/shared/UserSidebar";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { House, Wallet, Store, ChartBarBig } from "lucide-react";
import "../globals.css";
import "@/styles/components.css"

const UserLayout = ({children }: { children: React.ReactNode }) => {

  const organization = { name: "Dojang Studio" };

  const sidebarItems = [
    { name: "Dashboard", url: "/dashboard", icon: House, subItems: [] },
    { name: "Reports", url: "/dashboard/reports", icon: ChartBarBig, subItems: [] },
    { name: "Studios", url: "/dashboard/studios", icon: Store, 
      subItems: [
        { name: "Coaches", url: "/dashboard/studios/coaches" }, 
        { name: "Schedules", url: "/dashboard/studios/schedules" },
        { name: "Members", url: "/dashboard/studios/members" },
      ] },
    { name: "Finances", url: "/dashboard/finances", icon: Wallet, subItems: [] },
  ];

  return (
    <main className="flex h-full w-full bg-[#f8f6f6]">
      <RequireAuth>
        <SidebarProvider
          defaultOpen={true}
          >
            <UserSidebar
              sidebarItems={sidebarItems}
              organization={organization}
            />
            <SidebarTrigger className="cursor-pointer" />
            {children}
        </SidebarProvider>
      </RequireAuth>
    </main>
  );
}

export default UserLayout;