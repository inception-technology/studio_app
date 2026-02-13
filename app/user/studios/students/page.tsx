"use client";
import DashboardHeader from "@/components/shared/DashboardHeader";
//import { useAuth } from "@/contexts/AuthContext";
const Students = () => {
  //const { user } = useAuth();
  const user = { username: "john_doe" }; // Mock user for demonstration
  const date = new Date();
  return (
    <div className="flex flex-col w-full p-6">
      <DashboardHeader user_data={user} date={date} />
      <h1 className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 pb-2">Students</h1>

    </div>
  )
}

export default Students