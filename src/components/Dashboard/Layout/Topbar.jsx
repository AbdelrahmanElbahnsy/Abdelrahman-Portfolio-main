import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import SearchBar from './SearchBar';
import QuickActions from './QuickActions';
import NotificationCenter from './NotificationCenter';
import UserDropdown from './UserDropdown';
import { Menu } from 'lucide-react';

const Topbar = ({ title, onLogout, onSearchClick, onMenuClick }) => {
  return (
    <header className="shrink-0 sticky top-0 z-40 w-full h-16 bg-cms-background/70 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-4 md:px-8 gap-4">
      {/* Left section: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 md:flex-1 min-w-0">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block min-w-0">
          <Breadcrumbs title={title} />
        </div>
      </div>

      {/* Center section: Global Search */}
      <div className="flex-1 flex items-center justify-end md:justify-center">
        <SearchBar onClick={onSearchClick} />
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center justify-end gap-2 md:gap-4 md:flex-1 shrink-0">
        <div className="hidden sm:block">
          <QuickActions />
        </div>
        <div className="hidden sm:block w-px h-6 bg-white/10 mx-1 md:mx-2"></div>
        <NotificationCenter />
        <UserDropdown onLogout={onLogout} />
      </div>
    </header>
  );
};

export default Topbar;
