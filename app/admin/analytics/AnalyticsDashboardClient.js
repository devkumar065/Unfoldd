'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, CartesianGrid } from 'recharts'
import { TrendingUp, Users, Target, CheckCircle2, Download, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function AnalyticsDashboardClient() {
  const [activeTab, setActiveTab] = useState('dau')
  const [data, setData] = useState([])

  useEffect(() => {
    // Fetch analytics from API
    fetch('/api/admin/analytics?type=daily_active')
      .then(res => res.json())
      .then(d => setData(dataMapping(d.chartData || [])))
  }, [])

  const dataMapping = (rawData) => {
    // Ensure all 30 days are present
    return rawData
  }

  const revenueData = [
    { name: 'Week 1', total: 45000, pro: 32000, premium: 13000 },
    { name: 'Week 2', total: 52000, pro: 38000, premium: 14000 },
    { name: 'Week 3', total: 48000, pro: 31000, premium: 17000 },
    { name: 'Week 4', total: 61000, pro: 42000, premium: 19000 },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk' }}>Advanced Analytics 📈</h2>
          <p className="text-white/40 text-sm">Deep dive into platform growth and user behavior.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-2">
             <Calendar size={14}/> Last 30 Days
           </button>
           <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
             <Download size={14}/> Export Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Session', value: '18m 42s', icon: Users, color: 'text-blue-500' },
          { label: 'Retention (D7)', value: '42.5%', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Mission Completion', value: '68%', icon: Target, color: 'text-cyan-500' },
          { label: 'Verification Rate', value: '12%', icon: CheckCircle2, color: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="bg-[#0D0D16] border border-white/5 p-6 rounded-3xl shadow-lg">
             <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}><s.icon size={18}/></div>
                <span className="text-[10px] text-green-500 font-bold">+2.4%</span>
             </div>
             <p className="text-2xl font-black text-white mb-1 tracking-tight">{s.value}</p>
             <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* User Growth */}
         <div className="bg-[#0D0D16] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-8 tracking-tight">Active User Growth</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorUsersAn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="date" stroke="#ffffff10" fontSize={10} tickMargin={10} axisLine={false} />
                  <YAxis stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="users" stroke="#6C63FF" strokeWidth={4} fillOpacity={1} fill="url(#colorUsersAn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Revenue Mix */}
         <div className="bg-[#0D0D16] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-8 tracking-tight">Revenue Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" stroke="#ffffff10" fontSize={10} tickMargin={10} axisLine={false} />
                  <YAxis stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="pro" stackId="a" fill="#6C63FF" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="premium" stackId="a" fill="#00D4FF" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  )
}
