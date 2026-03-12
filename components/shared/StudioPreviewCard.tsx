"use client";
import { capitalize } from "@/lib/utils";
import Image from "next/image";
import Link from 'next/link';
import { 
  UserRound, 
  ChevronRight,
  TrendingUp
 } from "lucide-react";

type StudioPreviewCardProps = {
  id:number,
  name:string,
  location:string,
  members:number,
  finance:number,
  img_url:string
}

export default function StudioPreviewCard({
  id,
  name,
  location,
  members,
  finance,
  img_url
}: StudioPreviewCardProps) {

  return (
      <>
        <div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
          <Image 
            width={100} 
            height={100} 
            src={img_url}
            className="w-full h-full object-cover"
            data-alt={name}
            alt={name}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-bold text-slate-900 dark:text-white">{capitalize(name)}</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-xs text-slate-500 mb-2">{capitalize(location)}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <span className="material-icons text-[14px]"><UserRound/></span>{members}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <span className="material-icons text-[14px]"><TrendingUp/></span> ${finance}k
            </div>
          </div>
        </div>
        <Link href={`/studios/${id}`}className="material-icons text-slate-300 group-active:text-organization cursor-pointer"><ChevronRight/></Link>
      </>
  )
}