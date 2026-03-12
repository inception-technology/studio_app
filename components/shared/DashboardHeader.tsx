"use client";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHeader() {
  const { userProfile } = useAuth();
  console.log("User profile in DashboardHeader:", userProfile);
  const date = new Date();
  return (
    <div className="w-full flex items-center justify-between mt-4 mb-8">
      <div className="mb-4 text-lg flex flex-row items-center justify-between w-full text-gray-700 font-medium">
        <p>Hello {userProfile && (
          <strong>{userProfile.firstname.charAt(0).toUpperCase() + userProfile.firstname.slice(1)}</strong>
        )} 👋</p>
        <p className="text-sm">{date.toLocaleDateString("en", { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
