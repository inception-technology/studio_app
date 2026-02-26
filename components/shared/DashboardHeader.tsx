import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHeader() {
     const { profile } = useAuth();
      const date = new Date();
      console.log("DashboardHeader rendered with profile:", profile);
return (
    <div className="w-full flex mt-4 mb-8">
        <div className="mb-4 text-lg">Hello 
            {profile && (
            <strong> {profile.data.firstname.charAt(0).toUpperCase() + profile.data.firstname.slice(1)}</strong>
            )} 👋  
            <span> - {date.toLocaleDateString("en", { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
        </div>
    </div>
)
}