'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuSkeleton,
  SidebarGroupContent,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenu } from "../ui/dropdown-menu";
import DropdownAccountSwitcher from "./DropdownAccountSwitcher";

export default function DashboardSidebar(
  { sidebarItems,
    organization,
  }: {
    sidebarItems: { name: string; url: string; icon: React.ComponentType }[];
    organization: { name: string };
  }
) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile, state } = useSidebar();

  function isActive(url: string) {
    // Exact match pour /dashboard, startsWith pour les sous-routes
    return url === "/dashboard" ? pathname === url : pathname.startsWith(url);
  }

  function handleItemClick() {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  }

  return (
  <Sidebar collapsible="icon">

    <SidebarHeader className="">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton 
          className="
          h-30 
          flex 
          flex-col 
          items-center 
          justify-center 
          hover:bg-transparent focus:bg-transparent 
          transition-colors 
          hover:text-white focus:text-white"
          >
            <Image
              src="/logo_dojang.png"
              alt="logo"
              width={50}
              height={50}
            />
            <span className="font-bold text-gray-900 text-xl break-all">{organization.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        {sidebarItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              size="lg"
              isActive={isActive(item.url)}
              className="
                rounded-none px-5
                bg-white text-gray-900
                hover:bg-red-600 hover:text-white
                data-[active=true]:bg-gray-900 data-[active=true]:text-white
              "
              onClick={handleItemClick}
            >
              <Link href={item.url} className="h-15 flex items-center justify-start gap-2">
                <div className={`w-6 shrink-0 ${state === "collapsed" && !isMobile ? "m-2" : "m-0"}`}>
                  <item.icon />
                </div>
                <span className="text-xl font-medium text-inherit">{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter className="">

          <DropdownAccountSwitcher />

    </SidebarFooter>
  </Sidebar>
  )
}