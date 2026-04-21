'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { 
  Users, Activity, Sparkles, IndianRupee, Target, CheckCircle2, 
  RefreshCcw, AlertTriangle, CreditCard, ShieldAlert, Database, HardDrive, Server
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

export default function AdminDashboardClient({ initialMetrics }) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])
  const [feed, setFeed] = useState([])
  const [topStudents, setTopStudents] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // We fetch initial data and subscribe to realtime
  useEffect(() => {
    fetchDashboardData()

    // Realtime subscription for feed
    const channel = supabase
      .channel('admin_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analytics_events' }, 
        async (payload) => {
          if (!payload.new.event_type.startsWith('admin_')) {
             // Fetch user info for the new event
             const { data: user } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', payload.new.user_id).single()
             const newEvent = { ...payload.new, profile: user }
             setFeed(prev => [newEvent, ...prev].slice(0, 20))
          }
        }
      )
      .subscribe()

    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const fetchDashboardData = async () => {
    // Analytics fetch
    const res = await fetch('/api/admin/analytics?type=daily_active')
    if (res.ok) {
      const data = await res.json()
      setChartData(data.chartData || [])
    }

    // Pie chart mock data (or could fetch from API)
    setPieData([
      { name: 'Full Stack', value: 400, color: '#6C63FF' },
      { name: 'SDE', value: 300, color: '#00D4FF' },
      { name: 'Data Science', value: 300, color: '#00F5A0' },
      { name: 'UI/UX', value: 200, color: '#FFD700' },
      { name: 'Cybersecurity', value: 100, color: '#FF4444' }
    ])

    // Feed fetch
    const { data: recentEvents } = await supabase
      .from('analytics_events')
      .select('*, profile:profiles(full_name, avatar_url)')
      .not('event_type', 'like', 'admin_%')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (recentEvents) setFeed(recentEvents)

    // Top students fetch (using the view if available, or direct query)
    const { data: top } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, college, streak_count, xp_points')
      .order('xp_points', { ascending: false })
      .limit(10)
    if (top) setTopStudents(top)
  }

  const getEventDescription = (event) => {
    switch (event.event_type) {
      case 'mission_complete': return `completed Day ${event.event_data?.day || '?'} mission 🎯`
      case 'video_complete': return `watched video 📺`
      case 'test_pass': return `passed test ✅`
      case 'exam_complete': return `verified skill 🏆`
      case 'internship_apply': return `applied to internship 📩`
      case 'payment_success': return `upgraded plan 💰`
      case 'signup': return `joined Unfoldd 🎉`
      default: return `performed ${event.event_type}`
    }
  }

  const getEventColor = (type) => {
    if (type.includes('complete') || type.includes('pass') || type.includes('success')) return 'text-green-400 bg-green-400/10'
    if (type.includes('apply')) return 'text-cyan-400 bg-cyan-400/10'
    if (type === 'signup') return 'text-purple-400 bg-purple-500/10'
    return 'text-white/50 bg-white/5'
  }

  const STATS = useMemo(() => [
    { id: 1, label: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, color: 'text-blue-500', trend: '+12%', trendUp: true },
    { id: 2, label: 'Active Today', value: metrics?.activeToday || 0, icon: Activity, color: 'text-green-500', subLabel: 'users online now' },
    { id: 3, label: 'New Signups Today', value: metrics?.signupsToday || 0, icon: Sparkles, color: 'text-purple-500', trend: '+5%', trendUp: true },
    { id: 4, label: 'Revenue This Month', value: metrics?.revenueThisMonth || 0, icon: IndianRupee, color: 'text-yellow-500', prefix: '₹', trend: '-2%', trendUp: false },
    { id: 5, label: 'Missions Completed', value: metrics?.missionsToday || 0, icon: Target, color: 'text-cyan-500' },
    { id: 6, label: 'Skills Verified', value: metrics?.verifiedToday || 0, icon: CheckCircle2, color: 'text-green-400' }
  ], [metrics])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Platform Overview</h2>
          <p className="text-xs text-white/40 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <button onClick={fetchDashboardData} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors">
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {STATS.map(s => (
          <div key={s.id} className="bg-[#0D0D16] border border-white/5 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none group-hover:bg-white/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${s.color}`}>
                  <s.icon size={20} />
               </div>
               {s.trend && (
                 <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${s.trendUp ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                   {s.trendUp ? '↑' : '↓'} {s.trend} vs yesterday
                 </div>
               )}
            </div>
            <div className="relative z-10">
              <div className="flex items-end gap-1 mb-1">
                {s.prefix && <span className="text-xl text-white/50 font-bold mb-1">{s.prefix}</span>}
                <span className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
                   <CountUp end={s.value} separator="," duration={2} />
                </span>
              </div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{s.label}</div>
              {s.subLabel && <div className="text-[10px] text-green-500 mt-2 font-medium">{s.subLabel}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         {/* DAU Chart */}
         <div className="lg:col-span-3 bg-[#0D0D16] border border-white/5 p-6 rounded-3xl shadow-lg">
            <div className="mb-6">
              <h3 className="text-base font-bold text-white tracking-tight">Daily Active Users</h3>
              <p className="text-xs text-white/40">Last 30 days</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickFormatter={(val) => val} />
                  <Tooltip contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} labelStyle={{ color: '#9999BB', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="users" stroke="#6C63FF" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution Chart */}
         <div className="lg:col-span-2 bg-[#0D0D16] border border-white/5 p-6 rounded-3xl shadow-lg flex flex-col">
            <div className="mb-2">
              <h3 className="text-base font-bold text-white tracking-tight">User Distribution</h3>
              <p className="text-xs text-white/40">By target role</p>
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#fff', opacity: 0.6 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Row 3: Feed and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         {/* Live Feed */}
         <div className="lg:col-span-3 bg-[#0D0D16] border border-white/5 rounded-3xl shadow-lg flex flex-col h-[400px] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0A0A0F]/50">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                 Live Activity <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
              <AnimatePresence initial={false}>
                {feed.map((event) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 to-[#0A0A0F] border border-purple-500/30 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-inner overflow-hidden">
                      {event.profile?.avatar_url ? <Image src={event.profile.avatar_url} alt="" fill className="object-cover" /> : (event.profile?.full_name?.charAt(0) || 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">
                        <span className="font-bold text-white">{event.profile?.full_name || 'A student'}</span> {getEventDescription(event)}
                      </p>
                    </div>
                    <div className="text-[10px] text-white/30 shrink-0 font-medium whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </div>
                  </motion.div>
                ))}
                {feed.length === 0 && (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm italic">Waiting for activity...</div>
                )}
              </AnimatePresence>
            </div>
         </div>

         {/* Alerts */}
         <div className="lg:col-span-2 bg-[#0D0D16] border border-white/5 p-6 rounded-3xl shadow-lg flex flex-col h-[400px] overflow-hidden">
            <div className="mb-6 shrink-0">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Needs Attention <span className="text-xl">🚨</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 hide-scrollbar">
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col gap-3">
                 <div className="flex items-center gap-3 text-red-400 font-bold text-sm">
                    <ShieldAlert size={18} /> {metrics?.flaggedPending || 0} exams flagged for proctoring
                 </div>
                 <button className="self-end text-[10px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors">Review Now &rarr;</button>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex flex-col gap-3">
                 <div className="flex items-center gap-3 text-yellow-500 font-bold text-sm">
                    <CreditCard size={18} /> 2 failed transactions
                 </div>
                 <button className="self-end text-[10px] font-black uppercase tracking-widest text-white bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-xl transition-colors">View &rarr;</button>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">System Health</p>
                 <div className="flex items-center justify-between text-sm">
                   <span className="flex items-center gap-2 text-white/70"><Database size={14} className="text-purple-400" /> Database</span>
                   <span className="text-green-500 font-bold text-xs">Healthy</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="flex items-center gap-2 text-white/70"><HardDrive size={14} className="text-cyan-400" /> Storage</span>
                   <span className="text-green-500 font-bold text-xs">45% Used</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="flex items-center gap-2 text-white/70"><Server size={14} className="text-green-400" /> API Services</span>
                   <span className="text-green-500 font-bold text-xs">Operational</span>
                 </div>
              </div>
            </div>
         </div>
      </div>

      {/* Row 4: Top Performers */}
      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-[#0A0A0F]/50">
          <h3 className="text-base font-bold text-white tracking-tight">Top Students This Week</h3>
          <p className="text-xs text-white/40">Ranked by total XP and missions completed</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30 w-16 text-center">Rank</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Student</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">College</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Streak</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">XP</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topStudents.map((s, i) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-center">
                    {i === 0 ? <span className="text-2xl">🥇</span> : i === 1 ? <span className="text-2xl">🥈</span> : i === 2 ? <span className="text-2xl">🥉</span> : <span className="text-white/40 font-bold">{i + 1}</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {s.avatar_url ? <Image src={s.avatar_url} alt={`${s.full_name}'s avatar`} fill className="object-cover" /> : s.full_name?.charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-white">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white/60">{s.college || '—'}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-xs font-bold">🔥 {s.streak_count || 0}</span></td>
                  <td className="p-4"><span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold">⚡ {s.xp_points || 0}</span></td>
                  <td className="p-4 text-right">
                    <a href={`/admin/users/${s.id}`} className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors inline-block">View</a>
                  </td>
                </tr>
              ))}
              {topStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-white/30 text-sm italic">No student data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
