import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, Trash2, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const { notifications = [] } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set(JSON.parse(localStorage.getItem('readNotifications') || '[]')));
  const [deletedIds, setDeletedIds] = useState(() => new Set(JSON.parse(localStorage.getItem('deletedNotifications') || '[]')));
  const [filter, setFilter] = useState('all'); // 'all', 'alerts', 'activity'
  const buttonRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const navigate = useNavigate();

  const visibleNotifications = notifications.filter(n => !deletedIds.has(n.id));
  const filteredNotifications = visibleNotifications.filter(n => {
    if (filter === 'alerts') return n.type === 'warning' || n.type === 'error';
    if (filter === 'activity') return n.type === 'info' || n.type === 'success';
    return true;
  });
  
  const activeNotifications = visibleNotifications.filter(n => !readIds.has(n.id));

  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify([...readIds]));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem('deletedNotifications', JSON.stringify([...deletedIds]));
  }, [deletedIds]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen, visibleNotifications.length, filter]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const markAllAsRead = () => {
    const newReadIds = new Set(readIds);
    visibleNotifications.forEach(n => newReadIds.add(n.id));
    setReadIds(newReadIds);
  };

  const clearAll = () => {
    const newDeletedIds = new Set(deletedIds);
    visibleNotifications.forEach(n => newDeletedIds.add(n.id));
    setDeletedIds(newDeletedIds);
  };

  const toggleReadStatus = (id, e) => {
    e.stopPropagation();
    const newReadIds = new Set(readIds);
    if (newReadIds.has(id)) {
      newReadIds.delete(id);
    } else {
      newReadIds.add(id);
    }
    setReadIds(newReadIds);
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    const newDeletedIds = new Set(deletedIds);
    newDeletedIds.add(id);
    setDeletedIds(newDeletedIds);
  };

  const handleNotificationClick = (notification) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(notification.id);
    setReadIds(newReadIds);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-cms-warning" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-cms-danger" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-cms-success" />;
      default: return <Info className="w-4 h-4 text-cms-primary" />;
    }
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors border outline-none focus-visible:ring-2 focus-visible:ring-cms-primary ${isOpen ? 'text-white bg-white/5 border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'}`}
      >
        <Bell className="w-5 h-5" />
        {activeNotifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cms-primary shadow-glow-primary border border-cms-background"></span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ top: coords.top, right: coords.right }}
                className="fixed w-80 bg-cms-cards/95 backdrop-blur-xl border border-cms-border rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden z-[9999] flex flex-col"
              >
                <div className="p-3 border-b border-cms-border bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-cms-text font-bold text-sm flex items-center gap-2">
                      Notifications
                      {activeNotifications.length > 0 && (
                        <span className="bg-cms-primary/20 text-cms-primary px-1.5 py-0.5 rounded-full text-xs">{activeNotifications.length}</span>
                      )}
                    </h4>
                    <div className="flex gap-2">
                      {activeNotifications.length > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-cms-primary hover:text-cms-primary/80 transition-colors">Mark all read</button>
                      )}
                      {visibleNotifications.length > 0 && (
                        <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Clear all</button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                    {['all', 'alerts', 'activity'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1 rounded transition-colors ${filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => {
                      const isRead = readIds.has(notification.id);
                      return (
                        <div 
                          key={notification.id} 
                          onClick={() => handleNotificationClick(notification)}
                          className={`group relative p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${isRead ? 'opacity-75 bg-transparent' : 'bg-white/[0.02]'}`}
                        >
                          <div className="flex gap-3 items-start pr-12">
                            <div className="mt-0.5 p-1.5 rounded-full bg-white/5 shrink-0">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${isRead ? 'text-gray-400' : 'text-gray-200'} font-medium`}>{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={(e) => toggleReadStatus(notification.id, e)}
                              title={isRead ? "Mark as unread" : "Mark as read"}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              {isRead ? <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={(e) => deleteNotification(notification.id, e)}
                              title="Delete"
                              className="p-1.5 text-gray-400 hover:text-cms-danger hover:bg-cms-danger/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {!isRead && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-cms-primary rounded-r-full"></div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <CheckCircle className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-300 font-medium">You're all caught up!</p>
                      <p className="text-xs text-gray-500 mt-1">No {filter !== 'all' ? filter : 'new'} notifications.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default NotificationCenter;
