"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface DashboardStatsProps {
  itemsCount: number
}

export function DashboardStats({ itemsCount }: DashboardStatsProps) {
  return (
    <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 md:gap-8 mb-10 pb-4 snap-x snap-mandatory hide-scrollbar">
      <Card className="flex-shrink-0 w-64 md:w-auto snap-center p-8 rounded-[2rem] border-b-4 border-b-orange-500 shadow-sm bg-slate-900 transition-all hover:shadow-md text-white border-none">
        <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">Menú Activo</p>
        <p className="text-5xl font-black tracking-tighter">{itemsCount}</p>
      </Card>
      <Card className="flex-shrink-0 w-64 md:w-auto snap-center p-8 rounded-[2rem] border-b-4 border-b-green-500 shadow-sm bg-slate-900 transition-all hover:shadow-md text-white border-none">
        <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">Ventas Hoy</p>
        <p className="text-5xl font-black tracking-tighter">$0</p>
      </Card>
      <Card className="flex-shrink-0 w-64 md:w-auto snap-center p-8 rounded-[2rem] border-b-4 border-b-amber-500 shadow-sm bg-slate-900 transition-all hover:shadow-md text-white border-none">
        <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">Rating</p>
        <div className="flex items-center gap-2 text-5xl font-black tracking-tighter">
          5.0 <Star className="text-amber-400 fill-amber-400" />
        </div>
      </Card>
    </div>
  )
}
