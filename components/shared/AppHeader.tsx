"use client";
import { useAuth } from "@/contexts/AuthContext";
import { capitalize } from "@/lib/utils";

export default function AppHeader(props: {title:string}) {
  const { userProfile } = useAuth();
  const date = new Date();
  return (
    <div className="w-full flex flex-col items-center justify-between mt-4 mb-8">
      <div className="mb-4 text-lg flex flex-row items-center justify-between w-full text-gray-700 font-medium">
        <p>Hello {userProfile && (
          <strong>{userProfile.firstname.charAt(0).toUpperCase() + userProfile.firstname.slice(1)}</strong>
        )} 👋</p>
        <p className="text-sm">{date.toLocaleDateString("en", { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</p>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 pb-2 mb-4">
        {capitalize(props.title)}
      </h1>
    </div>
  );
}
