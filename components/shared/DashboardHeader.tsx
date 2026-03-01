"use client";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHeader() {
  const { profile } = useAuth();
  const date = new Date();
  return (
    <div className="w-full flex items-center justify-between mt-4 mb-8">
      <div className="mb-4 text-lg flex flex-col items-center gap-2">
        <p>{date.toLocaleDateString("en", { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</p>
        <p>Hello {profile && (
          <strong>{profile.firstname.charAt(0).toUpperCase() + profile.firstname.slice(1)}</strong>
        )} 👋</p>
      </div>
    </div>
  );
}
