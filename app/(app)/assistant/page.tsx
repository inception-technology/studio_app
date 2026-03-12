// app/assistant/page.tsx
"use client";
import AppHeader from "@/components/shared/AppHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { safeApiJson } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  Sparkles,
  TrendingUp,
  Ellipsis,
  ArrowLeft,
  Bot,
  Wallet,
  Lightbulb,
  PiggyBank,
  Send
 } from "lucide-react";
import Link from "next/link";


const AssistantPage = () => {
  
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    let alive = true;
    (async () => {
      //const users = await fetchDashboardData();
      //console.log("Fetched dashboard data:", users); // Debug log for fetched data
      //if (alive) setDashboardData(users);
      if (alive) console.warn("Dashboard data fetching is currently disabled. Please implement fetchDashboardData function to load real data.");
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
        <section className="ios-blur border-b border-organization/10 px-4 py-4">
            <div className="flex items-center justify-between">
            <button className="w-10 h-10 flex items-center justify-start text-slate-400">
            <Link href={"/studios"} className="material-icons cursor-pointer"><ArrowLeft/></Link>
            </button>
            <div className="flex flex-col items-center">
            <div className="relative">
            <div className="w-12 h-12 bg-organization rounded-full flex items-center justify-center text-white shadow-lg shadow-organization/20">
            <span className="material-symbols-outlined text-3xl"><Bot/></span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-background-dark rounded-full"></div>
            </div>
            <h1 className="text-sm font-bold mt-2">nb8 Assistant</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Analyse Mensuelle</p>
            </div>
            <button className="w-10 h-10 flex items-center justify-end text-slate-400">
            <span className="material-icons"><Ellipsis/></span>
            </button>
            </div>
        </section>
<div className="p-4 space-y-6 pb-40">
    <section className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
    <span className="material-symbols-outlined text-organization"><TrendingUp/></span>
    <h2 className="font-bold text-slate-800 dark:text-white">Performance des Studios</h2>
    </div>
    <div className="mb-4">
    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Le studio <span className="text-organization font-bold">Downtown Academy</span> affiche la plus forte croissance ce mois-ci (+18%). 
                    L&apos;augmentation est portée par le programme &rdquo;Enfants Débutants&ldquo;.
                </p>
    </div>
    <div className="h-32 flex items-end justify-between gap-2 px-2">
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-[60%]">
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">East</div>
    </div>
    <div className="w-full bg-organization rounded-t-lg relative group h-[100%] shadow-lg shadow-organization/20">
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-organization uppercase">DTWN</div>
    </div>
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-[40%]">
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">North</div>
    </div>
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-[75%]">
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">West</div>
    </div>
    </div>
    </section>

    <section className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-organization">analytics</span>
            <h2 className="font-bold text-slate-800 dark:text-white">Rétention des Éleves</h2>
        </div>
        <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
        <circle className="text-slate-100 dark:text-slate-800" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" stroke-width="8"></circle>
        <circle className="text-organization" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" stroke-dasharray="251.2" stroke-dashoffset="25.12" stroke-width="8"></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900 dark:text-white">90%</span>
        </div>
        </div>
        <div>
        <p className="text-sm font-semibold text-emerald-500 mb-1">Prédiction Positive</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Risque de désistement (churn) réduit de 4.2%. Les alertes de relance automatique ont sauvé 12 abonnements.
        </p>
        </div>
        </div>
    </section>

    <section className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-organization">
        <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-organization"><Wallet/></span>
            <h2 className="font-bold text-slate-800 dark:text-white">Optimisation Financière</h2>
        </div>
        
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-organization/10 flex items-center justify-center shrink-0">
                    <span className="material-icons text-organization text-sm"><Lightbulb/></span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Ajustement des Forfaits</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Suggère une augmentation de 5% sur le forfait &rdquo;Famille&ldquo; à North Branch (sous-évalué par rapport au marché local).
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-organization/10 flex items-center justify-center shrink-0">
                    <span className="material-icons text-organization text-sm"><PiggyBank/></span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Opportunité de Revenue</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Potentiel de <span className="text-organization font-bold">+$2,400</span> mensuels en automatisant les frais de retard.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <div className="flex gap-3 items-start pr-8">
        <div className="w-8 h-8 bg-organization rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
            <span className="material-symbols-outlined text-lg"><Bot/></span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                J&apos;ai analysé l&apos;ensemble de votre structure. Souhaitez-vous explorer un studio en particulier ou voir les projections pour le trimestre prochain ?
            </p>
        </div>
    </div>

    <div className="p-4 bg-white/95 dark:bg-slate-950/95 ios-blur border-t rounded-2xl p-10 border-slate-100 dark:border-slate-800 safe-area-bottom z-50">
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-3 flex items-center gap-3 border border-slate-200 dark:border-slate-800">
                <span className="material-icons text-slate-400 text-xl"><Sparkles/></span>
                <input className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full placeholder:text-slate-400" placeholder="Demander plus de détails à nb8..." type="text"/>
            </div>
            <button className="w-12 h-12 bg-organization rounded-full flex items-center justify-center text-white shadow-lg shadow-organization/20 active:scale-90 transition-transform">
                <span className="material-icons"><Send/></span>
            </button>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-2">
            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                Projections Q4
            </button>
            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                Détails Downtown
            </button>
            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                PDF Rapport
            </button>
        </div>
    </div>
</div>
</div>
  );
}
export default AssistantPage;