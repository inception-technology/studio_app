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
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DropdownAccountSwitcher() {

  const { profile } = useAuth();
  const router = useRouter();
  // Handle logout functionality
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
    }).catch(() => {});
    router.replace("/");
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-full justify-start">
        <Button variant="ghost" size="icon" 
        className="rounded-full flex gap-2 hover:bg-transparent focus:bg-transparent transition-colors cursor-pointer"
        >
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
          <div className="font-bold transition-colors">
            {profile && `${profile.data.firstname.charAt(0).toUpperCase() + profile.data.firstname.slice(1)} ${profile.data.lastname.charAt(0).toUpperCase() + profile.data.lastname.slice(1)}`}
            </div>
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
