import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ChevronRight, Briefcase, Code, Award, Home, Info, Terminal, Phone, Link as LinkIcon, Navigation, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { crudService } from '../../../cms/services/crudService';

export const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchableDocs, setSearchableDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);

      if (searchableDocs.length === 0) {
        const fetchAllDocs = async () => {
          setIsLoading(true);
          const collections = ['projects', 'skills', 'certifications', 'journey', 'hero', 'about', 'navbarItems', 'socials'];
          try {
            const promises = collections.map(col => 
              crudService.getAll(col).then(docs => docs.map(d => ({ ...d, _collection: col })))
            );
            const results = await Promise.all(promises);
            setSearchableDocs(results.flat());
          } catch (error) {
            console.error("Search fetch error", error);
          }
          setIsLoading(false);
        };
        fetchAllDocs();
      }
    }
  }, [isOpen]);

  const searchIndex = useMemo(() => {
    const staticRoutes = [
      { type: 'Route', title: 'Dashboard Overview', icon: Home, link: '/admin/overview' },
      { type: 'Route', title: 'Projects Manager', icon: Briefcase, link: '/admin/projects' },
      { type: 'Route', title: 'Skills Manager', icon: Code, link: '/admin/skills' },
      { type: 'Route', title: 'Certifications', icon: Award, link: '/admin/certifications' },
      { type: 'Route', title: 'Journey', icon: Terminal, link: '/admin/journey' },
      { type: 'Route', title: 'Social Links', icon: LinkIcon, link: '/admin/socials' },
      { type: 'Route', title: 'Navbar Menu', icon: Navigation, link: '/admin/navbar' },
      { type: 'Route', title: 'Hero Section', icon: Home, link: '/admin/home' },
      { type: 'Route', title: 'About Section', icon: Info, link: '/admin/about' },
      { type: 'Route', title: 'Contact Settings', icon: Phone, link: '/admin/contact' },
    ];

    const dynamicDocs = searchableDocs.map(item => {
      let routePath = `/admin/${item._collection}`;
      if (item._collection === 'hero') routePath = '/admin/home';
      if (item._collection === 'navbarItems') routePath = '/admin/navbar';
      
      return {
        type: item._collection,
        title: item.title || item.name || item.label || 'Untitled',
        icon: FileText,
        link: routePath
      };
    });

    return [...staticRoutes, ...dynamicDocs];
  }, [searchableDocs]);

  const filteredResults = query.trim() === '' 
    ? searchIndex.filter(i => i.type === 'Route')
    : searchIndex.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex].link);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  const handleSelect = (link) => {
    navigate(link);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-cms-cards border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-white/10">
            <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
              placeholder="Search anything (Projects, Skills, Pages...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gray-400 bg-white/5 border border-white/10 rounded">ESC</kbd>
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {isLoading ? (
              <div className="px-4 py-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-cms-primary animate-spin mb-3" />
                <p className="text-gray-400 font-medium">Indexing collections...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((result, idx) => {
                const Icon = result.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div 
                    key={idx}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleSelect(result.link)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-cms-primary text-white' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{result.title}</span>
                        <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'} capitalize`}>{result.type}</span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-white" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-12 text-center">
                <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No results found for "{query}"</p>
                <p className="text-sm text-gray-500 mt-1">Try searching for pages, projects, or skills</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
