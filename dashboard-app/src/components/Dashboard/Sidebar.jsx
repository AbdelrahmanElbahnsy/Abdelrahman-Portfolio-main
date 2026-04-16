import React, { memo } from 'react';
import { Briefcase, Code, User, LogOut, Home, Info, Award, Phone, BarChart3, Navigation, Link as LinkIcon } from 'lucide-react';

// Extracted static array outside the render cycle to prevent memory reallocation
const TABS = [
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5 text-blue-400" /> },
  { id: 'navbar', label: 'Navbar Menu', icon: <Navigation className="w-5 h-5" /> },
  { id: 'home', label: 'Hero Section', icon: <Home className="w-5 h-5" /> },
  { id: 'about', label: 'About Section', icon: <Info className="w-5 h-5" /> },
  { id: 'skills', label: 'Skills', icon: <Code className="w-5 h-5" /> },
  { id: 'projects', label: 'Projects', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'certifications', label: 'Certifications', icon: <Award className="w-5 h-5" /> },
  { id: 'socials', label: 'Social Links', icon: <LinkIcon className="w-5 h-5" /> },
  { id: 'contact', label: 'Contact Info', icon: <Phone className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile Settings', icon: <User className="w-5 h-5" /> }
];

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <aside className="w-64 bg-[#131b2c] border-r border-[#1e293b] min-h-screen fixed left-0 top-0 flex flex-col z-20 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-[#1e293b] bg-[#0a0f1c]/50">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="text-[#14f195]">CMS</span>Admin
        </h1>
        <p className="text-xs text-gray-400 mt-2">Manage Portfolio & Analytics</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto w-full custom-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors focus:outline-none ${
                isActive 
                  ? 'bg-[#14f195]/10 text-[#14f195] border border-[#14f195]/20 shadow-inner shadow-[#14f195]/5' 
                  : 'text-gray-400 hover:bg-[#1e293b] hover:text-gray-100 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e293b] bg-[#0a0f1c]/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl font-bold border border-transparent hover:border-red-500/20 transition-colors shadow-sm focus:outline-none"
        >
          <LogOut className="w-5 h-5" />
          Standalone Mode
        </button>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
