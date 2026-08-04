import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, Shield, Key, Bell, Palette, Activity, 
  Users, Server, AlertTriangle, MonitorSmartphone, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'sessions', label: 'Active Sessions', icon: MonitorSmartphone },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'developer', label: 'API & Developer', icon: Server },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

const AccountCenter = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Account Card (Premium Header) */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-cms-cards border border-cms-border shadow-2xl">
        {/* Cover Image */}
        <div className="h-48 w-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cms-cards/90"></div>
        </div>

        {/* Profile Info Area */}
        <div className="relative px-8 pb-8 flex flex-col md:flex-row gap-6 items-end md:items-center -mt-16">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-cms-background border-4 border-cms-cards flex items-center justify-center shadow-2xl overflow-hidden group">
              {/* Fallback Avatar */}
              <div className="w-full h-full bg-gradient-to-tr from-cms-primary to-cms-accent flex items-center justify-center text-4xl font-black text-cms-background">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
            </div>
            {/* Online Status Badge */}
            <div className="absolute -bottom-2 -right-2 bg-cms-cards p-1.5 rounded-full border border-cms-border shadow-lg">
              <div className="w-4 h-4 rounded-full bg-cms-success animate-pulse"></div>
            </div>
          </div>

          <div className="flex-1 mt-16 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-cms-text flex items-center gap-3">
                  Abdelrahman El-Bahnsy
                  <span className="bg-cms-primary/10 text-cms-primary text-xs font-bold px-2 py-1 rounded border border-cms-primary/20 tracking-wider uppercase">
                    Owner
                  </span>
                </h1>
                <p className="text-cms-muted text-lg mt-1">{user?.email}</p>
                <div className="flex items-center gap-6 mt-3 text-sm font-medium text-gray-400">
                  <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-cms-primary" /> Verified Account</span>
                  <span>Member since Aug 2026</span>
                  <span>Last login: Just now</span>
                </div>
              </div>

              {/* Storage Stats mini widget */}
              <div className="bg-cms-background border border-cms-border rounded-xl p-4 w-full md:w-64">
                <div className="flex justify-between text-xs font-bold text-cms-muted mb-2 uppercase tracking-wider">
                  <span>Storage Usage</span>
                  <span>45%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cms-primary to-cms-accent w-[45%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">4.5 GB of 10 GB used</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Area */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none
                    ${isActive 
                      ? tab.danger 
                        ? 'bg-cms-danger/10 text-cms-danger border border-cms-danger/20' 
                        : 'bg-cms-primary/10 text-cms-primary border border-cms-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : tab.danger 
                        ? 'text-red-400/70 hover:bg-red-500/5 hover:text-red-400 border border-transparent'
                        : 'text-cms-muted hover:bg-white/5 hover:text-cms-text border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-70'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-cms-cards border border-cms-border rounded-3xl p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-cms-text mb-4">Account Overview</h2>
                  <p className="text-cms-muted">Manage your personal settings, security preferences, and workspace configuration.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                     <div className="bg-cms-background border border-cms-border p-5 rounded-2xl hover:border-cms-primary/50 transition-colors cursor-pointer group">
                       <Shield className="w-6 h-6 text-cms-primary mb-3 group-hover:scale-110 transition-transform" />
                       <h3 className="text-white font-bold mb-1">Security Status</h3>
                       <p className="text-sm text-gray-500">2FA is currently disabled. We recommend enabling it.</p>
                     </div>
                     <div className="bg-cms-background border border-cms-border p-5 rounded-2xl hover:border-cms-primary/50 transition-colors cursor-pointer group">
                       <MonitorSmartphone className="w-6 h-6 text-cms-primary mb-3 group-hover:scale-110 transition-transform" />
                       <h3 className="text-white font-bold mb-1">Active Sessions</h3>
                       <p className="text-sm text-gray-500">You are logged in on 2 devices.</p>
                     </div>
                  </div>
                </div>
              )}
              {activeTab !== 'overview' && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-2xl">
                  <div className="text-center">
                    <p className="text-cms-muted font-medium">Settings module</p>
                    <p className="text-white font-bold text-lg">{TABS.find(t => t.id === activeTab)?.label}</p>
                    <p className="text-sm text-gray-500 mt-2">Implementation pending based on requirements.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AccountCenter;
