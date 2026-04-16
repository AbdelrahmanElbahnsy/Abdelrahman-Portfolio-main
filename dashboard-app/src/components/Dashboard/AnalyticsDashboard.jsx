import React, { useState, useEffect, memo } from 'react';
import { getVisitsStats, subscribeToVisitsStats } from '../../services/analytics';
import { BarChart3, Users, Calendar, Activity, Loader2 } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    visitsToday: 0,
    dailyVisits: {},
    recentDailyVisits: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitialStats = async () => {
      const initialStats = await getVisitsStats();

      if (!isMounted) {
        return;
      }

      setStats(initialStats);
      setError(initialStats?.error || null);
      setLoading(false);
    };

    loadInitialStats();

    const unsubscribe = subscribeToVisitsStats(
      (nextStats) => {
        if (!isMounted) {
          return;
        }

        setStats(nextStats);
        setError(null);
        setLoading(false);
      },
      (subscriptionError) => {
        if (!isMounted) {
          return;
        }

        setError(subscriptionError);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
     return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>;
  }

  const recentDays = stats?.recentDailyVisits || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <BarChart3 className="text-[#14f195] w-8 h-8"/> 
        Visitor Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#131b2c] p-6 rounded-3xl border border-[#1e293b] flex items-center gap-6 shadow-sm relative overflow-hidden group hover:border-[#14f195]/30 transition-colors">
          <div className="w-14 h-14 bg-[#14f195]/10 rounded-2xl flex items-center justify-center text-[#14f195] relative z-10">
            <Users className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 font-medium">Total Lifetime Visits</p>
            <h3 className="text-4xl font-black text-white mt-1">{stats?.totalVisits || 0}</h3>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#14f195]/5 rounded-full blur-2xl -mr-16 -mt-16" />
        </div>

        <div className="bg-[#131b2c] p-6 rounded-3xl border border-[#1e293b] flex items-center gap-6 shadow-sm relative overflow-hidden group hover:border-blue-400/30 transition-colors">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 relative z-10">
            <Activity className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 font-medium">Visits Today</p>
            <h3 className="text-4xl font-black text-white mt-1">{stats?.visitsToday || 0}</h3>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-400">
          Unable to load live analytics right now. Showing the latest safe fallback values.
        </p>
      ) : null}

      <div className="bg-[#131b2c] p-8 rounded-3xl border border-[#1e293b] shadow-sm mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-[#1e293b] pb-4">
          <Calendar className="text-[#14f195] w-6 h-6"/>
          Recent Daily Breakdown
        </h3>
        
        {recentDays.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No daily records found yet.</p>
        ) : (
          <div className="space-y-4">
            {recentDays.map(([dateString, count]) => (
              <div key={dateString} className="flex justify-between items-center p-4 bg-[#0a0f1c] rounded-xl border border-[#1e293b] hover:border-[#14f195]/30 transition-colors shadow-sm">
                <span className="font-medium text-gray-300">
                  {new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="bg-[#14f195]/10 text-[#14f195] font-bold px-4 py-1.5 rounded-lg flex items-center gap-2">
                   <Users className="w-4 h-4"/> {count} visits
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(AnalyticsDashboard);
