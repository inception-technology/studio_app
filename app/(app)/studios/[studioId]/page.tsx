// app/studios/[studioId]/page.tsx
import { 
  Share2,
  WandSparkles,
  Sparkles,
  CircleUser,
  CalendarDays,
  UserRoundCheck,
  UserRound, 
  Banknote,
  ChevronRight,
  ArrowLeft
 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { capitalize }from "@/lib/utils"

import { MyStudios } from "@/lib/mock-data";

type StudioPageProps = {
  params: Promise<{
    studioId: string;
  }>;
};


export default async function StudioDetailPage({ params }: StudioPageProps) {

  const { studioId } = await params;
  const myStudio = MyStudios.find(
    (studio) => studio.id === Number(studioId)
  )
  if (!myStudio) {
    return <div>Studio not found</div>
  }
  return (
    <div className="flex flex-col w-full p-6">
      <section className="flex justify-between items-center ios-blur border-b border-organization/10 px-4 py-4">
        <button className="w-10 h-10 flex items-center justify-start text-slate-400">
          <Link href={"/studios"} className="material-icons cursor-pointer"><ArrowLeft/></Link>
        </button>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Studio Analysis</h2>
        <button className="w-8 h-8 flex items-center justify-end text-organization">
            <span className="material-icons"><Share2/></span>
        </button>
      </section>
        <section>
            <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-organization/20 shrink-0">
            <Image 
                width={100} 
                height={100} 
                alt={myStudio.name}
                src={myStudio.img_url}
            />
            </div>
            <div className="flex-1">
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{capitalize(myStudio.name)}</h1>
            <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{capitalize(myStudio.location)}</p>
            </div>
            </div>
            </div>
        </section>
        <div className="p-4 pb-24 space-y-4">
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
            <div className="flex items-center gap-1.5 bg-organization/5 dark:bg-organization/20 px-2 py-1 rounded-full">
            <span className="material-symbols-outlined text-organization text-[14px] font-bold"><Sparkles/></span>
            <span className="text-[10px] font-bold text-organization uppercase tracking-tighter">nb8 AI Assistant</span>
            </div>
            </div>
            <div className="relative z-10 pt-4">
            <h2 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Health Summary</h2>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {capitalize(myStudio.name)} is currently 
                <span className="font-bold text-emerald-600">Performing Well</span>. 
                Financial growth is outpacing expectations, though attendance rates among intermediate students dipped 3% this week. 
                I recommend reviewing Thursday&apos;s 6 PM className schedule.
                </p>
            </div>
            </section>
            <div className="grid grid-cols-1 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined"><Banknote/></span>
            </div>
            <div className="flex-1">
            <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Finance</h3>
            <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Excellent</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">${myStudio.finance}k</span>
            <span className="text-[10px] text-slate-400 font-medium">vs $12.4k exp.</span>
            </div>
            </div>
            <span className="material-icons text-slate-300"><ChevronRight/></span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-organization/5 dark:bg-organization/20 flex items-center justify-center text-organization">
            <span className="material-symbols-outlined"><CircleUser/></span>
            </div>
            <div className="flex-1">
            <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Students</h3>
            <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase">Attention</span>
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            </div>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">450 Active</span>
            <span className="text-[10px] text-slate-400 font-medium">84% Attendance</span>
            </div>
            </div>
            <span className="material-icons text-slate-300"><ChevronRight/></span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined"><UserRound/></span>
            </div>
            <div className="flex-1">
            <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Coaches</h3>
            <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Optimal</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">8 staff</span>
            <span className="text-[10px] text-slate-400 font-medium">164 total hrs/wk</span>
            </div>
            </div>
            <span className="material-icons text-slate-300"><ChevronRight/></span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined"><CalendarDays/></span>
            </div>
            <div className="flex-1">
            <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Schedules</h3>
            <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Healthy</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">92% Utilized</span>
            <span className="text-[10px] text-slate-400 font-medium">3 over capacity</span>
            </div>
            </div>
            <span className="material-icons text-slate-300"><ChevronRight/></span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
            <span className="material-symbols-outlined"><UserRoundCheck/></span>
            </div>
            <div className="flex-1">
            <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Enrollment</h3>
            <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase">Warning</span>
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            </div>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white">+24 New</span>
            <span className="text-[10px] text-rose-500 font-bold">12% Churn</span>
            </div>
            </div>
            <span className="material-icons text-slate-300"><ChevronRight/></span>
            </div>
            </div>
            <div className="mt-4 px-1">
            
            <button className="w-full bg-organization text-white font-bold py-4 rounded-xl shadow-lg shadow-organization/20 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[20px]"><WandSparkles/></span>
            <Link href={"/assistant"}><span>Generate In-Depth AI Report</span></Link>
            </button>
            </div>
        </div>
    </div>
  )
};
