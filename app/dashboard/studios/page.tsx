"use client";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { useState, useEffect } from "react";
import { useAuth} from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { safeJson } from "@/lib/utils";

type Studio = {
  id: number;
  name: string;
  country_code: string;
};
type Studios= {
  studios: Studio[];  
}

async function fetchStudios(): Promise<Studios | null> {
  try {
    //STUDIOS
    const res = await fetch("/api/studios", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });
      if (res.status !== 200) {
        return null;
      }
      const data = await safeJson<Studios>(res);
      if (!data) return null;
      return data;
  } catch (error) {
    console.error("Error fetching studios data:", error);
    return null;
  }
}


const Studios = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [studiosData, setStudiosData] = useState<Studio[] | null>(null);

  useEffect(() => {
      if(!isLoading && !isAuthenticated) {
        router.replace("/");
        return;
      }
      const loadData = async () => {
        const [studiosData] = await Promise.all([
          fetchStudios()
        ]);
        setStudiosData(studiosData ? studiosData.studios : null);
      };
      loadData();
    }, [isLoading, isAuthenticated, router]);

  return isLoading ? (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  ) : (
    <div className="flex flex-col w-full p-6">
      <DashboardHeader />
      <h1 className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 pb-2">
        Studios
      </h1>
      <div className="mt-4 text-gray-700">
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Studio Name</th>
              <th className="border border-gray-300 p-2 text-left">Country Code</th>
              <th className="border border-gray-300 p-2 text-left">Edit</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(studiosData) ? (
              studiosData.map((studio) => (
                <tr key={studio.id}>
                  <td className="border border-gray-300 p-2">{studio.name}</td>
                  <td className="border border-gray-300 p-2">{studio.country_code}</td>
                  <td className="border border-gray-300 p-2">
                    <button className="text-blue-500 hover:underline"><Pencil /></button>
                  </td>
                </tr> 
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border border-gray-300 p-2 text-center">No studios available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Studios;