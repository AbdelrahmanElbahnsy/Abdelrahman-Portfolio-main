import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getVisitsStats, subscribeToVisitsStats } from '../../services/analytics';
import { BarChart3, Users, Calendar, Activity, Loader2, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dateStr = new Date(`${data.dateString}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    return (
      <div className="bg-[#0a0f1c] border border-white/10 p-3 rounded-lg shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#14f195]" />
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{dateStr}</p>
        <p className="text-white text-lg font-black flex items-center gap-2">
          <Users className="w-4 h-4 text-[#14f195]" />
          {data.visits} {data.visits === 1 ? 'Visit' : 'Visits'}
        </p>
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    visitsToday: 0,
    visitsLast7Days: 0,
    visitsLast30Days: 0,
    dailyVisits: {},
    recentDailyVisits: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitialStats = async () => {
      const initialStats = await getVisitsStats();
      if (!isMounted) return;
      setStats(initialStats);
      setError(initialStats?.error || null);
      setLoading(false);
    };

    loadInitialStats();

    const unsubscribe = subscribeToVisitsStats(
      (nextStats) => {
        if (!isMounted) return;
        setStats(nextStats);
        setError(null);
        setLoading(false);
      },
      (subscriptionError) => {
        if (!isMounted) return;
        setError(subscriptionError);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-[#14f195] rounded-full animate-spin shadow-[0_0_15px_rgba(20,241,149,0.3)]"></div>
        <p className="text-gray-400 font-bold text-sm tracking-wider uppercase animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 bg-red-500/5 border border-red-500/20 rounded-2xl m-6">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <h3 className="text-white font-bold text-lg">Unable to load analytics data</h3>
        <p className="text-gray-400 text-sm">Please check your connection and try again.</p>
      </div>
    );
  }

  const chartData = (stats?.recentDailyVisits || []).map(([dateString, count]) => ({
    dateString,
    visits: count,
    displayDate: new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const hasVisits = stats?.totalVisits > 0;

  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const start7 = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const start30 = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full space-y-6 pb-20 pt-4 md:pt-8">
      
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Analytics Console
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-2 h-2 rounded-full bg-[#14f195] text-[#14f195] shadow-[0_0_8px_currentColor] animate-pulse"></span>
              Live Tracking Active
            </span>
          </div>
        </div>
      </motion.div>

      {hasVisits ? (
        <>
          {/* KPI ROW */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cms-cards border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors flex flex-col h-full group">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-gray-400 transition-colors">Lifetime Visits</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">{stats.totalVisits}</h3>
                  <p className="text-[10px] text-gray-600 font-medium mt-2">All time</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-gray-400 transition-transform group-hover:scale-110">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-cms-cards border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors flex flex-col h-full group">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-gray-400 transition-colors">Visits Today</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">{stats.visitsToday}</h3>
                  <p className="text-[10px] text-gray-600 font-medium mt-2">{todayDate}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-gray-400 transition-transform group-hover:scale-110">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-cms-cards border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors flex flex-col h-full group">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-gray-400 transition-colors">Last 7 Days</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">{stats.visitsLast7Days}</h3>
                  <p className="text-[10px] text-gray-600 font-medium mt-2">{start7} - {todayDate}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-gray-400 transition-transform group-hover:scale-110">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-cms-cards border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors flex flex-col h-full group">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-gray-400 transition-colors">Last 30 Days</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">{stats.visitsLast30Days}</h3>
                  <p className="text-[10px] text-gray-600 font-medium mt-2">{start30} - {todayDate}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-gray-400 transition-transform group-hover:scale-110">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* CHART AREA */}
          <motion.div variants={itemVariants} className="bg-cms-cards border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#14f195]" /> 7-Day Traffic Breakdown
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Daily Visits</p>
            </div>
            
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="visits" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.visits > 0 ? '#14f195' : '#374151'} fillOpacity={entry.visits > 0 ? 1 : 0.2} className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-24 px-4 bg-cms-cards border border-white/5 rounded-2xl text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-6 border border-white/10">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Awaiting Data</h3>
          <p className="text-gray-400 max-w-md">Visitor tracking is active, but no visits have been recorded yet. Share your portfolio to start generating analytics.</p>
        </motion.div>
      )}

    </motion.div>
  );
};

export default memo(AnalyticsDashboard);
