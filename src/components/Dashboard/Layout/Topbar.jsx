import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import SearchBar from './SearchBar';
import QuickActions from './QuickActions';
import NotificationCenter from './NotificationCenter';
import UserDropdown from './UserDropdown';

const Topbar = ({ title, onLogout, onSearchClick }) => {
  return (
    <header className="shrink-0 sticky top-0 z-40 w-full h-16 bg-cms-background/70 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-6 md:px-8">
      {/* Left section: Breadcrumbs */}
      <div className="flex-1 flex items-center">
        <Breadcrumbs title={title} />
      </div>

      {/* Center section: Global Search */}
      <div className="flex-1 flex items-center justify-center">
        <SearchBar onClick={onSearchClick} />
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex-1 flex items-center justify-end gap-4">
        <QuickActions />
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        <NotificationCenter />
        <UserDropdown onLogout={onLogout} />
      </div>
    </header>
  );
};

export default Topbar;
