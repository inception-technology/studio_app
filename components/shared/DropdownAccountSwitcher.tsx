"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";

export default function DropdownAccountSwitcher() {

  const { userProfile, logout } = useAuth();
  const { state } = useSidebar();
  // Handle logout functionality
  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-full justify-start">
        <Button variant="ghost" size="icon" 
        className="rounded-full flex gap-2 hover:bg-transparent focus:bg-transparent transition-colors cursor-pointer"
        >
          <Avatar>
            <AvatarImage src={userProfile?.avatar_url ?? undefined} alt="avatar" />
            <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
              {userProfile?.firstname?.[0]?.toUpperCase()}{userProfile?.lastname?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {state === "expanded" && (
            <div className="font-bold transition-colors px-2 hidden md:inline-flex text-gray-900">
              {userProfile && `${userProfile.firstname.charAt(0).toUpperCase()
                + userProfile.firstname.slice(1)} ${userProfile.lastname.charAt(0).toUpperCase()
                + userProfile.lastname.slice(1)}`}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full md:w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheckIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOutIcon />
          <button 
          className="cursor-pointer" 
          onClick={(e) => { e.preventDefault(); handleLogout(); }}
          >Logout</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}
