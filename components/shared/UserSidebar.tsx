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
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenu } from "../ui/dropdown-menu";

// DropdownAccountSwitcher is un composant qui utilise des hooks et ne peut pas être rendu côté serveur, d'où le dynamic import avec ssr: false
const DropdownAccountSwitcher = dynamic(
  () => import("@/components/shared/DropdownAccountSwitcher"),
  { ssr: false }
);

export default function UserSidebar(
  { sidebarItems,
    organization,
  }: {
    sidebarItems: { name: string; url: string; icon: React.ComponentType }[];
    organization: { name: string };
  }
) {

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
              src="/assets/logo_dojang.png"
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
      <SidebarMenuItem key={item.name} className="w-full flex items-center gap-5">
        <SidebarMenuButton asChild  className=" rounded-none px-5">
          <a
            href={item.url}
            className="
              h-15 flex items-center gap-2
              transition-colors
              hover:bg-gray-800 hover:text-white
              focus:bg-organization focus:text-white
            "
          >
            <item.icon />
            <span className="text-xl font-medium">{item.name}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
</SidebarContent>


    <SidebarFooter className="">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <DropdownAccountSwitcher />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

  </Sidebar>
  )
}