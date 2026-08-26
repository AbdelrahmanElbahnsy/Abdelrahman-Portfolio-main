import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Database, Cloud, Zap, CheckCircle2, Clock, CheckCircle, 
  FileText, Code, Image as ImageIcon, Briefcase,
  AlertTriangle, FolderOpen, LayoutTemplate, Link as LinkIcon, Award,
  Terminal, Home, Info, Phone, Edit, ExternalLink, RefreshCw, GitBranch, User, Settings, Filter,
  Bell, HardDrive, ShieldCheck, ChevronRight, Search, X
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import AnalyticsIntegrationModal from './Modals/AnalyticsIntegrationModal';
import HealthDiagnosticsModal from './Modals/HealthDiagnosticsModal';
import SystemDiagnosticsModal from './Modals/SystemDiagnosticsModal';
import { useDashboard } from '../../context/DashboardContext';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#111827] border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-white font-bold mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
          {data.name}
        </p>
        <p className="text-sm text-gray-400">Total Count: <strong className="text-white">{data.value}</strong></p>
        <p className="text-sm text-gray-400">Percentage: <strong className="text-white">{(data.percent * 100).toFixed(1)}%</strong></p>
      </div>
    );
  }
  return null;
};

const OverviewDashboard = () => {
  const { 
    counts, latestUpdates, recentActivity, pendingTasks, 
    notifications, healthScore, healthDiagnostics, storageStats,
    systemHealth, isLoading, isRefetching, refreshDashboard 
  } = useDashboard();
  const navigate = useNavigate();
  
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [systemModalState, setSystemModalState] = useState({ isOpen: false, serviceKey: null });
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set());
  const [lastChecked, setLastChecked] = useState(new Date());

  const CONTENT_DIST = counts ? [
    { name: 'Projects', value: counts.projects || 0, color: '#22C55E', path: '/admin/projects' },
    { name: 'Skills', value: counts.skills || 0, color: '#38BDF8', path: '/admin/skills' },
    { name: 'Certifications', value: counts.certifications || 0, color: '#F59E0B', path: '/admin/certifications' },
    { name: 'Journey', value: counts.journey || 0, color: '#A855F7', path: '/admin/journey' },
    { name: 'Socials', value: counts.socials || 0, color: '#EF4444', path: '/admin/socials' },
    { name: 'Navbar', value: counts.navbarItems || 0, color: '#EC4899', path: '/admin/navbar' },
    { name: 'Pages', value: (counts.hero || 0) + (counts.about || 0) + (counts.profile || 0), color: '#6366F1', path: '/admin/home' },
  ].filter(c => c.value > 0) : [];
  
  const totalContentValue = CONTENT_DIST.reduce((acc, curr) => acc + curr.value, 0);
  const enrichedDist = CONTENT_DIST.map(item => ({ ...item, percent: item.value / totalContentValue }));

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  const getCollectionIcon = (collection) => {
    switch (collection) {
      case 'projects': return <Briefcase className="w-4 h-4" />;
      case 'skills': return <Code className="w-4 h-4" />;
      case 'certifications': return <Award className="w-4 h-4" />;
      case 'journey': return <Terminal className="w-4 h-4" />;
      case 'socials': return <LinkIcon className="w-4 h-4" />;
      case 'navbarItems': return <LayoutTemplate className="w-4 h-4" />;
      case 'hero': return <Home className="w-4 h-4" />;
      case 'about': return <Info className="w-4 h-4" />;
      case 'contact': return <Phone className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getManagerRoute = (collection, id) => {
    if (['hero', 'about', 'contact'].includes(collection)) {
      return `/admin/${collection === 'hero' ? 'home' : collection}`;
    }
    if (collection === 'navbarItems') return `/admin/navbar`;
    return `/admin/${collection}${id ? `?edit=${id}` : ''}`;
  };

  const handleRefreshSystem = async (e) => {
    e.stopPropagation();
    await refreshDashboard();
    setLastChecked(new Date());
  };

  if (isLoading && !isRefetching && !counts) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-cms-border border-t-cms-primary rounded-full animate-spin shadow-glow-primary"></div>
      </div>
    );
  }

  const allSystemsOnline = systemHealth && Object.values(systemHealth).every(s => ['online', 'configured', 'unknown'].includes(s.status));
  const activeWarnings = (notifications ?? []).filter(n => !dismissedWarnings.has(n.id) && (n.type === 'warning' || n.type === 'error'));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full space-y-6 pb-20">
      
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Command Center
            {isRefetching && <RefreshCw className="w-5 h-5 text-cms-primary animate-spin" />}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${allSystemsOnline ? 'bg-emerald-400 text-emerald-400' : 'bg-cms-warning text-cms-warning'}`}></span>
              {allSystemsOnline ? 'Operational' : 'Degraded'}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">AdminOS v2.0</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <kbd className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/5 border border-white/5 rounded-md">
            <Search className="w-3 h-3"/> Ctrl+K
          </kbd>
          <button onClick={() => refreshDashboard()} className="flex items-center gap-2 px-4 py-2 bg-cms-primary hover:bg-[#10d482] text-[#0a0f1c] rounded-lg font-bold transition-colors">
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} /> Sync Now
          </button>
        </div>
      </motion.div>

      {/* METRICS ROW */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div onClick={() => setIsHealthModalOpen(true)} className="bg-cms-cards border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors cursor-pointer group flex flex-col h-full">
          <div className="flex justify-between items-start mb-auto">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-gray-400 transition-colors">Health Score</p>
              <h3 className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                {healthScore ?? 100}<span className="text-sm text-gray-500 font-bold">%</span>
              </h3>
            </div>
            <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${healthScore === 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cms-warning/10 text-cms-warning'}`}>
              {healthScore === 100 ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${healthScore === 100 ? 'bg-emerald-400' : 'bg-cms-warning'}`} style={{ width: `${healthScore ?? 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Storage Overview */}
        <div className="bg-cms-cards border border-white/5 rounded-xl p-5 cursor-default flex flex-col h-full">
          <div className="flex justify-between items-start mb-auto">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Storage</p>
              <h3 className="text-[13px] font-bold text-gray-400 mt-2">Storage unavailable</h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-4 flex items-center gap-2">
            {storageStats?.cloudinaryImages || 0} Images <span className="w-1 h-1 rounded-full bg-gray-600"></span> {storageStats?.firestoreDocs || 0} Docs
          </p>
        </div>

        {/* Projects Counter */}
        <div className="bg-cms-cards border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors cursor-pointer group flex flex-col h-full" onClick={() => navigate('/admin/projects')}>
          <div className="flex justify-between items-start mb-auto">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Projects</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{counts?.projects || 0}</h3>
            </div>
            <div className="p-2 rounded-lg bg-cms-primary/10 text-cms-primary transition-transform group-hover:scale-110">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-4 flex items-center group-hover:text-cms-primary transition-colors">
            Manage Portfolio <ChevronRight className="w-3 h-3 ml-auto"/>
          </p>
        </div>

        {/* Skills Counter */}
        <div className="bg-cms-cards border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors cursor-pointer group flex flex-col h-full" onClick={() => navigate('/admin/skills')}>
          <div className="flex justify-between items-start mb-auto">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Skills</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{counts?.skills || 0}</h3>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 transition-transform group-hover:scale-110">
              <Code className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-4 flex items-center group-hover:text-purple-400 transition-colors">
            Manage Stack <ChevronRight className="w-3 h-3 ml-auto"/>
          </p>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Quick Actions (Dense Matrix) */}
          <motion.div variants={itemVariants} className="bg-cms-cards border border-white/5 rounded-xl p-6">
            <h3 className="font-bold text-white mb-5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cms-primary" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: 'New Project', icon: Briefcase, path: '/admin/projects' },
                { label: 'New Skill', icon: Code, path: '/admin/skills' },
                { label: 'New Cert', icon: Award, path: '/admin/certifications' },
                { label: 'New Journey', icon: Terminal, path: '/admin/journey' },
                { label: 'Edit Hero', icon: Home, path: '/admin/home' },
                { label: 'Edit About', icon: Info, path: '/admin/about' },
                { label: 'Edit Contact', icon: Phone, path: '/admin/contact' },
                { label: 'Social Links', icon: LinkIcon, path: '/admin/socials' },
                { label: 'Upload Image', icon: ImageIcon, path: '/admin/media' },
                { label: 'Settings', icon: Settings, path: '/admin/profile' },
                { label: 'View Site', icon: ExternalLink, path: '/', external: true },
                { label: 'Deploy', icon: Cloud, path: '/admin/account' },
              ].map(action => (
                <button 
                  key={action.label} 
                  disabled={action.disabled}
                  title={action.disabled ? 'Available after this module is implemented.' : ''}
                  onClick={() => action.external ? window.open(action.path, '_blank') : navigate(action.path)}
                  className={`flex flex-col items-center justify-center py-3 px-2 border rounded-lg transition-all group ${action.disabled ? 'bg-black/10 border-white/5 opacity-50 cursor-not-allowed' : 'bg-black/20 hover:bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <action.icon className={`w-4 h-4 transition-colors mb-2 ${action.disabled ? 'text-gray-600' : 'text-gray-500 group-hover:text-white'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center leading-tight ${action.disabled ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}`}>{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Action Required & Pending Tasks */}
          {(activeWarnings?.length > 0 || (pendingTasks ?? []).length > 0) ? (
            <motion.div variants={itemVariants} className="bg-cms-cards border border-white/5 rounded-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-cms-warning" /> Action Required
                </h3>
                <span className="bg-cms-warning/10 text-cms-warning px-2 py-0.5 rounded text-xs font-bold">{activeWarnings.length + (pendingTasks?.length || 0)}</span>
              </div>
              <div className="divide-y divide-white/5">
                {activeWarnings.map((n, index) => (
                  <div key={n.id || `warn-${index}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-full bg-red-500/10 text-red-400 shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-200 font-medium leading-snug mb-1">{n.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-9 sm:ml-0">
                      <button 
                        onClick={() => navigate(n.link || '/admin/overview')}
                        className="px-3 py-1.5 bg-cms-primary/10 hover:bg-cms-primary/20 text-cms-primary text-xs font-bold rounded transition-colors"
                      >
                        Fix Issue
                      </button>
                      <button 
                        onClick={() => {
                          const newSet = new Set(dismissedWarnings);
                          newSet.add(n.id);
                          setDismissedWarnings(newSet);
                        }}
                        className="px-3 py-1.5 hover:bg-white/5 text-gray-500 hover:text-gray-300 text-xs font-bold rounded transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {(pendingTasks ?? []).map((task, index) => (
                  <div key={task.id || `task-${index}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(task.link)}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-full bg-cms-warning/10 text-cms-warning shrink-0 group-hover:bg-cms-warning/20 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 font-medium leading-snug group-hover:text-white transition-colors">{task.title}</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-cms-primary hover:text-white transition-colors bg-cms-primary/10 hover:bg-cms-primary/20 px-3 py-1.5 rounded shrink-0 ml-9 sm:ml-0">Fix Issue</button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-400 mb-1">All caught up!</h3>
                <p className="text-sm text-gray-400">No active warnings or pending tasks.</p>
              </div>
            </motion.div>
          )}

          {/* Latest Global Updates */}
          <motion.div variants={itemVariants} className="bg-cms-cards border border-white/5 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Latest Updates
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {(latestUpdates ?? []).length > 0 ? (latestUpdates ?? []).map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(getManagerRoute(item._collection, item.id))}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-black/40 flex items-center justify-center border border-white/5 text-gray-500 shrink-0 overflow-hidden">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : getCollectionIcon(item._collection)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-white bg-white/10 px-1.5 py-0.5 rounded shadow-sm">{item._collection}</span>
                        <p className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                          {item.title || item.name || item.label || item.firstName || (() => {
                            const map = {
                              navbarItems: 'Navbar Item',
                              socials: 'Social Link',
                              certifications: 'Certification',
                              projects: 'Project',
                              skills: 'Skill',
                              hero: 'Hero Section',
                              about: 'About Section',
                              contact: 'Contact Info',
                              journey: 'Journey Item'
                            };
                            return map[item._collection] || item._collection.charAt(0).toUpperCase() + item._collection.slice(1);
                          })()}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-gray-500">
                        Updated {item.updatedAt ? formatDistanceToNow(item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt)) + ' ago' : 'recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(getManagerRoute(item._collection, item.id)); }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-bold text-white transition-colors border border-transparent hover:border-white/10"
                    >
                      Edit
                    </button>
                    {(item.liveLink || item.githubLink) && (
                      <a href={item.liveLink || item.githubLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 text-sm">No recent updates found.</div>
              )}
            </div>
          </motion.div>

          {/* Traffic / Analytics Overview (Honestly not configured) */}
          <motion.div variants={itemVariants} className="bg-cms-cards border border-white/5 rounded-xl p-8 relative overflow-hidden text-center flex flex-col items-center">
             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 border border-white/10 mb-4">
               <Activity className="w-6 h-6" />
             </div>
             <h4 className="text-lg font-bold text-white mb-2">Analytics Not Configured</h4>
             <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">Real-time traffic and audience insights are currently unavailable. Connect Google Analytics or Vercel Analytics to enable this feature.</p>
             <button 
               onClick={() => setIsAnalyticsModalOpen(true)}
               className="px-5 py-2 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-colors"
             >
               Setup Integration
             </button>
          </motion.div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* System Status */}
          <motion.div variants={itemVariants} className="bg-cms-cards border border-white/5 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" /> System Status
              </h3>
              <button onClick={handleRefreshSystem} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white tooltip-trigger group relative">
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="absolute -top-8 right-0 bg-cms-cards border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Refresh Status</span>
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {systemHealth && Object.entries(systemHealth).map(([key, info]) => (
                <div 
                  key={key} 
                  onClick={() => setSystemModalState({ isOpen: true, serviceKey: key })} 
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-gray-400 group-hover:text-white transition-colors`}>
                      {key === 'firestore' ? <Database className="w-4 h-4" /> : 
                       key === 'vercel' ? <Cloud className="w-4 h-4" /> : 
                       key === 'github' ? <GitBranch className="w-4 h-4" /> : 
                       <ImageIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">{info.label}</p>
                      <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        {info.status === 'online' ? `${info.latency}ms latency` : 
                         info.status === 'configured' ? 'Configured' :
                         info.status === 'unknown' ? 'Unknown state' :
                         'Connection Failed'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100">Details</span>
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${info.status === 'online' ? 'bg-emerald-500 text-emerald-500' : info.status === 'configured' ? 'bg-blue-500 text-blue-500' : info.status === 'unknown' ? 'bg-gray-500 text-gray-500' : 'bg-red-500 text-red-500'}`}></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 text-center font-medium mt-auto">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          </motion.div>

          {/* Content Distribution Mini Pie */}
          <motion.div variants={itemVariants} className="bg-cms-cards border border-white/5 rounded-xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-gray-400"/> Content Breakdown
            </h3>
            <div className="h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={enrichedDist} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={40} 
                    outerRadius={60} 
                    paddingAngle={2} 
                    dataKey="value" 
                    stroke="none"
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    {enrichedDist.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        onClick={() => navigate(entry.path)} 
                        className="hover:opacity-80 transition-opacity outline-none"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white">{storageStats?.firestoreDocs || 0}</span>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Docs</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {enrichedDist.map(item => (
                <button 
                  key={item.name} 
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
      
      <HealthDiagnosticsModal isOpen={isHealthModalOpen} onClose={() => setIsHealthModalOpen(false)} score={healthScore} diagnostics={healthDiagnostics} />
      <SystemDiagnosticsModal isOpen={systemModalState.isOpen} onClose={() => setSystemModalState({ isOpen: false, serviceKey: null })} initialServiceKey={systemModalState.serviceKey} />
      <AnalyticsIntegrationModal isOpen={isAnalyticsModalOpen} onClose={() => setIsAnalyticsModalOpen(false)} />
    </motion.div>
  );
};

export default OverviewDashboard;
