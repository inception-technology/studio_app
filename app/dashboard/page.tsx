"use client";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { useState, useEffect } from "react";
import { useAuth, Users } from "@/contexts/AuthContext";
import { safeJson } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

// Function to fetch dashboard data (e.g., users list)
async function fetchDashboardData(): Promise<Users | null> {
  try {
    //All users from current user organization
    const res = await fetch("/api/org/users", {
        method: "GET",
        cache: "no-store",
      });
      if (res.status !== 200) {
        return null;
      }
      const data = await safeJson<Users>(res);
      console.log("Fetched dashboard data:", data);
      if (!data) return null;
      return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

const Dashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<Users | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    let alive = true;

    (async () => {
      const users = await fetchDashboardData();
      if (alive) setDashboardData(users);
    })();

    return () => {
      alive = false;
    };
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Option: si non auth, tu peux aussi retourner null
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col w-full p-6">
      <DashboardHeader />
      <h1 className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 pb-2">
        Dashboard
      </h1>
      <div className="mt-4 text-gray-700">
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Full Name</th>
              <th className="border border-gray-300 p-2 text-left">Email</th>
              <th className="border border-gray-300 p-2 text-left">Role</th>
              <th className="border border-gray-300 p-2 text-left">Edit</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(dashboardData) ? (
              dashboardData.map((user) => (
                <tr key={user.user_id}>
                  <td className="border border-gray-300 p-2">{user.firstname} {user.lastname}</td>  
                  <td className="border border-gray-300 p-2">{user.email}</td>
                  <td className="border border-gray-300 p-2">{user.role_name}</td>
                  <td className="border border-gray-300 p-2">
                    <button className="text-blue-500 hover:underline"><Pencil /></button>
                  </td>
                </tr> 
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 p-2 text-center">No users available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Dashboard;
