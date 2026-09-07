import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import {
  Search, Grid, List as ListIcon, X, UploadCloud, Loader2, AlertTriangle,
  FolderOpen, Image as ImageIcon, Copy, Database, Maximize2, Trash2, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// DELETE DIALOG
// ─────────────────────────────────────────────────────────────────────────────
const DeleteDialog = ({ item, onCancel, onConfirm }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030814]/80 animate-in fade-in backdrop-blur-sm">
      <div className="bg-[#0f1829] border border-[#1a2440] rounded-2xl w-full max-w-[380px] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <span className="font-mono text-[10px] font-bold text-red-500/70 uppercase tracking-[0.2em] mb-2 block">
          SOFT DELETE ASSET
        </span>
        <p className="text-white font-bold text-sm mb-2 truncate px-4">{item.originalFilename || 'Unnamed Asset'}</p>
        <div className="text-gray-400 text-xs leading-relaxed mb-6 bg-[#030814]/50 p-4 rounded-xl border border-[#1a2440]">
          This will remove the asset from the Media Library index only.
          <br /><br />
          <span className="text-[#14f195]">The Cloudinary file will remain stored and existing portfolio references will continue to work.</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-400 font-bold text-sm hover:text-white hover:bg-[#1a2440] transition-colors border border-transparent hover:border-[#334155]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
          >
            Remove from Index
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
const PreviewModal = ({ item, onClose }) => {
  if (!item) return null;

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (ts) => {
    if (!ts) return 'Unknown';
    if (ts.toDate) return ts.toDate().toLocaleString();
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-[#030712]/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-[900px] h-full max-h-[90vh] flex flex-col md:flex-row bg-[#050914] border border-[#1e2d42] shadow-2xl rounded-2xl overflow-hidden m-4 animate-in zoom-in-95 duration-200">
        
        {/* Left: Image Viewer */}
        <div className="flex-1 bg-[#030712] flex items-center justify-center p-6 relative border-b md:border-b-0 md:border-r border-[#1e2d42] min-h-[300px]">
          <img src={item.url} alt={item.originalFilename || 'Media'} className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg" />
          <div className="absolute top-4 left-4">
            <span className="bg-[#14f195]/10 text-[#14f195] border border-[#14f195]/30 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" />
              {item.format || 'IMAGE'}
            </span>
          </div>
        </div>

        {/* Right: Metadata Panel */}
        <div className="w-full md:w-[350px] flex flex-col bg-[#050914] overflow-y-auto">
          <div className="px-6 py-5 border-b border-[#1e2d42] flex justify-between items-center sticky top-0 bg-[#050914]/95 backdrop-blur z-10">
            <h3 className="text-white font-bold text-sm tracking-wide">Asset Details</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-[#4b6385] hover:text-white rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6 space-y-6 flex-grow">
            <div>
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4b6385] mb-2">Original Filename</label>
              <p className="text-white text-sm break-all font-medium">{item.originalFilename || 'Unknown'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4b6385] mb-1.5 flex items-center gap-1.5"><Maximize2 className="w-3 h-3" /> Dimensions</label>
                <p className="text-white text-sm font-mono">{item.width && item.height ? `${item.width} × ${item.height}` : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4b6385] mb-1.5 flex items-center gap-1.5"><Database className="w-3 h-3" /> File Size</label>
                <p className="text-white text-sm font-mono">{item.bytes ? `${(item.bytes / 1024).toFixed(1)} KB` : 'N/A'}</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4b6385] mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Uploaded</label>
              <p className="text-gray-300 text-sm">{formatDate(item.createdAt)}</p>
            </div>

            <div className="h-px bg-[#1e2d42] my-4" />

            <div>
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#14f195] mb-2">Secure URL</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={item.url} className="w-full bg-[#090e17] border border-[#1e2d42] rounded-lg px-3 py-2 text-[11px] text-gray-300 font-mono outline-none" />
                <button onClick={() => copyToClipboard(item.url, 'URL')} className="px-3 py-2 bg-[#1e2d42] hover:bg-[#2a3a52] text-white rounded-lg transition-colors border border-transparent hover:border-gray-500">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {item.publicId && (
              <div>
                <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-400 mb-2">Public ID</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value={item.publicId} className="w-full bg-[#090e17] border border-[#1e2d42] rounded-lg px-3 py-2 text-[11px] text-gray-300 font-mono outline-none" />
                  <button onClick={() => copyToClipboard(item.publicId, 'Public ID')} className="px-3 py-2 bg-[#1e2d42] hover:bg-[#2a3a52] text-white rounded-lg transition-colors border border-transparent hover:border-gray-500">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MediaManager() {
  const { data: rawMedia, loading, fetchAll, remove } = useFirestoreCrud('media', { orderByField: 'createdAt', orderDirection: 'desc' });
  const { uploadImage, isUploading, uploadProgress, resetUploadState } = useImageUpload();
  
  const fileInputRef = useRef(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);

  // ── Stats & Filtering ──────────────────────────────────────────────────────
  const media = useMemo(() => {
    if (!rawMedia) return [];
    return rawMedia;
  }, [rawMedia]);

  const stats = useMemo(() => {
    let totalBytes = 0;
    media.forEach(m => totalBytes += (m.bytes || 0));
    return { 
      total: media.length, 
      sizeMB: (totalBytes / (1024 * 1024)).toFixed(2)
    };
  }, [media]);

  const filteredMedia = useMemo(() => {
    return media.filter(m => {
      // Type filter
      if (filterType === 'IMAGE' && m.resourceType !== 'image') return false;
      if (filterType === 'OTHER' && m.resourceType === 'image') return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !(m.originalFilename && m.originalFilename.toLowerCase().includes(q)) &&
          !(m.publicId && m.publicId.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
  }, [media, filterType, searchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading to Cloudinary...', { id: 'upload' });
      await uploadImage(file);
      toast.success('Upload complete!', { id: 'upload' });
      await fetchAll(); // Fetch fresh data after upload
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`, { id: 'upload' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      resetUploadState();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      toast.loading('Removing from index...', { id: 'delete' });
      await remove(deleteTarget.id);
      await fetchAll();
      toast.success('Removed from Media Library.', { id: 'delete' });
    } catch (err) {
      toast.error('Failed to remove asset.', { id: 'delete' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && (!rawMedia || rawMedia.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[55vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#14f195]" />
          <span className="text-gray-500 font-mono text-[10px] font-bold uppercase tracking-widest">Fetching Assets...</span>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* ══ PAGE HEADER ══ */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
          <div>
            <span className="text-[#14f195] font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 block flex items-center gap-2">
              <Database className="w-3.5 h-3.5" /> ASSET LEDGER
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mb-2">
              Media Library
            </h1>
            <p className="text-gray-500 text-sm max-w-xl">
              Centralized index of all Cloudinary uploads. Removing an asset here only deletes the index record, keeping public portfolio links intact.
            </p>
          </div>
          
          <div className="self-start sm:self-auto flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-3 bg-[#14f195] text-[#090e1a] text-sm font-bold rounded-xl hover:bg-[#10d482] transition-all shadow-[0_0_20px_rgba(20,241,149,0.15)] hover:shadow-[0_0_30px_rgba(20,241,149,0.3)] disabled:opacity-50 shrink-0"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Media'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-[#0b1120] border border-[#1a2440] rounded-xl px-5 py-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold mb-1">Total Assets</span>
            <span className="text-white font-black text-lg leading-none">{stats.total}</span>
          </div>
          <div className="w-px h-8 bg-[#1a2440]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold mb-1">Index Size</span>
            <span className="text-[#14f195] font-black text-lg leading-none">{stats.sizeMB} MB</span>
          </div>
        </div>
      </div>

      {/* ══ TOOLBAR ══ */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by filename or ID..."
            className="w-full h-11 pl-10 pr-9 bg-[#0b1120] border border-[#1a2440] rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-[#14f195]/40 focus:outline-none focus:ring-1 focus:ring-[#14f195]/40 transition-all shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 ml-auto w-full md:w-auto">
          <div className="flex bg-[#0b1120] border border-[#1a2440] rounded-xl p-1 shadow-sm">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'IMAGE', label: 'Images' },
              { key: 'OTHER', label: 'Other' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  filterType === key
                    ? 'bg-[#1a2440] text-[#14f195] shadow-sm'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex bg-[#0b1120] border border-[#1a2440] rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-[#1a2440] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-[#1a2440] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTENT AREA ══ */}
      {filteredMedia.length === 0 ? (
        <div className="bg-[#0b1120] border border-[#1a2440] rounded-2xl flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#131b2c] border border-[#1e2d42] flex items-center justify-center mb-6 shadow-inner">
            <FolderOpen className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Media Found</h3>
          <p className="text-gray-500 text-sm max-w-md mb-8">
            {searchQuery || filterType !== 'ALL' 
              ? 'No assets match your current filters. Try adjusting your search query.' 
              : 'Your media library index is currently empty. Upload an asset to get started.'}
          </p>
          {(!searchQuery && filterType === 'ALL') && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-[#1e2d42] text-white font-bold text-sm rounded-xl hover:bg-[#2a3a52] transition-colors border border-transparent hover:border-gray-500 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" /> Upload First Asset
            </button>
          )}
        </div>
      ) : (
        viewMode === 'GRID' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div key={item.id} className="bg-[#0b1120] border border-[#1a2440] rounded-xl overflow-hidden hover:border-[#334155] transition-all group flex flex-col shadow-sm hover:shadow-xl">
                {/* Image Container */}
                <div 
                  className="w-full aspect-square bg-[#050914] relative border-b border-[#1a2440] overflow-hidden cursor-pointer flex items-center justify-center p-4"
                  onClick={() => setPreviewTarget(item)}
                >
                  <img 
                    src={item.url} 
                    alt={item.originalFilename || 'Media asset'} 
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#030712]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-[#14f195] text-[#090e1a] px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2">
                      <Maximize2 className="w-3.5 h-3.5" /> Preview
                    </span>
                  </div>
                </div>

                {/* Meta Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white text-xs font-bold truncate mb-1" title={item.originalFilename}>{item.originalFilename || 'Unnamed Asset'}</h4>
                    <p className="text-[#4b6385] font-mono text-[9px] uppercase tracking-wider mb-3">
                      {item.format || 'IMG'} • {item.bytes ? `${(item.bytes / 1024).toFixed(0)} KB` : 'UNK'}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#1a2440]/50">
                    <button
                      onClick={() => copyToClipboard(item.url, 'URL')}
                      className="flex-1 py-1.5 rounded bg-[#131b2c] hover:bg-[#1e2d42] text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">Copy</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="w-8 h-8 rounded bg-[#131b2c] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center shrink-0"
                      title="Soft Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-[#0b1120] border border-[#1a2440] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#050914] border-b border-[#1a2440]">
                    <th className="px-5 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest w-16">Preview</th>
                    <th className="px-5 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Details</th>
                    <th className="px-5 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Format</th>
                    <th className="px-5 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Dimensions</th>
                    <th className="px-5 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest hidden lg:table-cell">Size</th>
                    <th className="px-5 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2440]/50">
                  {filteredMedia.map((item) => (
                    <tr key={item.id} className="hover:bg-[#131b2c]/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div 
                          className="w-12 h-12 rounded bg-[#050914] border border-[#1e2d42] flex items-center justify-center cursor-pointer overflow-hidden p-1 relative"
                          onClick={() => setPreviewTarget(item)}
                        >
                          <img src={item.url} alt="" className="max-w-full max-h-full object-contain" loading="lazy" />
                          <div className="absolute inset-0 bg-[#14f195]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-bold truncate max-w-[200px] sm:max-w-[300px]">
                            {item.originalFilename || 'Unnamed Asset'}
                          </span>
                          <span className="text-[#4b6385] font-mono text-[9px] truncate max-w-[200px] sm:max-w-[300px] mt-0.5">
                            {item.publicId || item.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span className="bg-[#14f195]/10 text-[#14f195] border border-[#14f195]/20 px-2 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-widest">
                          {item.format || 'UNK'}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="text-gray-300 font-mono text-xs">
                          {item.width && item.height ? `${item.width}x${item.height}` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <span className="text-gray-300 font-mono text-xs">
                          {item.bytes ? `${(item.bytes / 1024).toFixed(1)} KB` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewTarget(item)}
                            className="p-2 rounded bg-[#1e2d42] hover:bg-[#2a3a52] text-gray-300 hover:text-white transition-colors"
                            title="Preview Details"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.url, 'URL')}
                            className="p-2 rounded bg-[#1e2d42] hover:bg-[#2a3a52] text-gray-300 hover:text-white transition-colors"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 rounded bg-[#1e2d42] hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                            title="Soft Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ══ MODALS ══ */}
      <DeleteDialog 
        item={deleteTarget} 
        onCancel={() => setDeleteTarget(null)} 
        onConfirm={handleDeleteConfirm} 
      />
      <PreviewModal
        item={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />
    </div>
  );
}
