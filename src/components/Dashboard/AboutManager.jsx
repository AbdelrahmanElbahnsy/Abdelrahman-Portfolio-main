import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { aboutSchema } from '../../cms/schemas';
import { personalInfo } from '../../data/portfolioData';
import { 
  Loader2, Save, Undo2, User, FileText, Award, Terminal, 
  Monitor, Plus, Trash2, CheckCircle2, ChevronUp, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const AboutManager = () => {
  const { data, loading, setDocData, subscribe } = useFirestoreSingleDoc('about', 'main');

  const [formData, setFormData] = useState({
    subtitle: '',
    title: '',
    lead: '',
    paragraphs: [],
    badges: [],
    terminalItems: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving', 'success'

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  const loadData = useCallback((docData) => {
    if (!docData) return;
    
    let parsedParagraphs = [];
    let parsedBadges = [];
    let parsedTerminalItems = [];

    try { if (docData.paragraphsJson) parsedParagraphs = JSON.parse(docData.paragraphsJson); } catch (e) {}
    try { if (docData.badgesJson) parsedBadges = JSON.parse(docData.badgesJson); } catch (e) {}
    try { if (docData.terminalItemsJson) parsedTerminalItems = JSON.parse(docData.terminalItemsJson); } catch (e) {}

    setFormData({
      subtitle: docData.subtitle || '',
      title: docData.title || '',
      lead: docData.lead || '',
      paragraphs: Array.isArray(parsedParagraphs) ? parsedParagraphs : [],
      badges: Array.isArray(parsedBadges) ? parsedBadges : [],
      terminalItems: Array.isArray(parsedTerminalItems) ? parsedTerminalItems : []
    });
    setSaveStatus('saved');
    setIsDirty(false);
  }, []);

  useEffect(() => {
    if (data && !isDirty) {
      loadData(data);
    }
  }, [data, isDirty, loadData]);

  const handleTextChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      setIsDirty(true);
      setSaveStatus('unsaved');
      return updated;
    });
  }, []);

  const handleArrayChange = useCallback((arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      setIsDirty(true);
      setSaveStatus('unsaved');
      return { ...prev, [arrayName]: newArray };
    });
  }, []);

  const addArrayItem = useCallback((arrayName, template) => {
    setFormData(prev => {
      setIsDirty(true);
      setSaveStatus('unsaved');
      return { ...prev, [arrayName]: [...prev[arrayName], template] };
    });
  }, []);

  const removeArrayItem = useCallback((arrayName, index) => {
    setFormData(prev => {
      const newArray = prev[arrayName].filter((_, i) => i !== index);
      setIsDirty(true);
      setSaveStatus('unsaved');
      return { ...prev, [arrayName]: newArray };
    });
  }, []);

  const moveArrayItem = useCallback((arrayName, index, direction) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      if (direction === 'up' && index > 0) {
        [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      } else if (direction === 'down' && index < newArray.length - 1) {
        [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]];
      }
      setIsDirty(true);
      setSaveStatus('unsaved');
      return { ...prev, [arrayName]: newArray };
    });
  }, []);

  const handleDiscard = () => {
    if (data) {
      loadData(data);
    }
  };

  const validateData = () => {
    if (!formData.title?.trim() || !formData.subtitle?.trim()) {
      toast.error('Subtitle and Section Title are required.');
      return false;
    }

    for (let i = 0; i < formData.paragraphs.length; i++) {
      const p = formData.paragraphs[i];
      if (!p.text?.trim() && !p.highlight?.trim() && !p.suffix?.trim()) {
        toast.error(`Paragraph ${i + 1} is empty. Remove it or add text.`);
        return false;
      }
    }

    for (let i = 0; i < formData.badges.length; i++) {
      const b = formData.badges[i];
      if (!b.icon?.trim() || !b.label?.trim()) {
        toast.error(`Badge ${i + 1} is missing an icon or label.`);
        return false;
      }
    }

    for (let i = 0; i < formData.terminalItems.length; i++) {
      const tItem = formData.terminalItems[i];
      if (!tItem.key?.trim() || !tItem.value?.trim()) {
        toast.error(`Terminal Item ${i + 1} is missing a key or value.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateData()) return;

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const payloadToSave = {
        subtitle: formData.subtitle,
        title: formData.title,
        lead: formData.lead,
        paragraphsJson: JSON.stringify(formData.paragraphs),
        badgesJson: JSON.stringify(formData.badges),
        terminalItemsJson: JSON.stringify(formData.terminalItems)
      };

      await setDocData(payloadToSave);
      
      setIsDirty(false);
      setSaveStatus('success');
      toast.success('About Section Updated');
      
      setTimeout(() => {
        setSaveStatus('saved');
      }, 3000);
    } catch (err) {
      toast.error(`Error saving About Section: ${err.message}`);
      setSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !data) {
    return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>;
  }

  const LivePreview = () => {
    return (
      <div className="w-full flex flex-col">
        {/* Browser Frame */}
        <div className="bg-[#0a0f1c] rounded-xl border border-[#1e293b] shadow-2xl overflow-hidden flex flex-col w-full min-h-[500px]">
          
          {/* Browser Top Strip */}
          <div className="h-8 bg-[#131b2c] border-b border-[#1e293b] flex items-center px-4 gap-2 relative">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] opacity-50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#eab308] opacity-50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] opacity-50"></div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-[9px] text-gray-500 font-medium uppercase tracking-widest hidden sm:block flex items-center gap-2">
              <Monitor className="w-3 h-3" /> Live Preview
            </div>
          </div>

          {/* About Viewport */}
          <div className="flex-grow p-6 sm:p-8 relative overflow-hidden bg-[#0a0f1c]">
            {/* Header */}
            <div className="mb-8">
              <span className="text-[#14f195] font-mono uppercase tracking-widest text-[10px] mb-2 block">
                {formData.subtitle || 'Subtitle'}
              </span>
              <h2 className="text-3xl font-black text-white">{formData.title || 'Section Title'}</h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 items-start">
              
              {/* Terminal */}
              <div className="w-full rounded-2xl overflow-hidden border border-[#1e293b] shadow-xl bg-gradient-to-b from-[#131b2c] to-[#0a0f1c]">
                <div className="bg-[#1e293b]/50 p-3 flex items-center gap-3 border-b border-[#1e293b]">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                  </div>
                  <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">{personalInfo.terminalTitle || 'Terminal'}</span>
                </div>
                <div className="p-4 sm:p-5 font-mono text-[10px] sm:text-xs">
                  <ul className="space-y-3">
                    {formData.terminalItems.map((item, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-[#14f195] shrink-0">{item.key || 'key'}:</span>
                        <span className="text-gray-300 break-words">{item.value || 'value'}</span>
                      </li>
                    ))}
                    <li className="pt-2 flex gap-2 items-center">
                      <span className="text-[#14f195]">~</span>
                      <span className="text-[#14f195] text-sm animate-pulse">█</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Text Area */}
              <div className="flex flex-col gap-5">
                {formData.lead && (
                  <p className="text-lg font-bold text-white border-l-2 border-[#14f195] pl-4 py-1 bg-[#14f195]/5">
                    {formData.lead}
                  </p>
                )}
                
                {formData.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {p.text}{' '}
                    {p.highlight && <strong className="text-white">{p.highlight}</strong>}{' '}
                    {p.suffix}
                  </p>
                ))}

                {formData.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.badges.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#131b2c] border border-blue-900/30 text-[10px] font-bold text-gray-300">
                        <i className={`${b.icon} text-[#14f195] text-sm`}></i> {b.label || 'Badge'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Compact Disclaimer */}
        <p className="text-[10px] text-gray-500 mt-2 text-center font-medium">
          Preview reflects current unsaved form values.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-16 animate-in fade-in duration-500">
      
      {/* PAGE HEADER */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] rounded-t-xl mb-6 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative z-10 mt-2">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <User className="w-6 h-6 text-[#14f195]" /> About Section
          </h1>
          <p className="text-gray-400 mt-1 text-xs">
            Manage the story, expertise highlights, and technical profile displayed in the About section.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {saveStatus === 'saved' && (
              <span className="text-gray-500 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> All changes saved</span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-orange-400 flex items-center gap-1.5 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20 shadow-[0_0_10px_rgba(251,146,60,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> Unsaved changes
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-blue-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'success' && (
              <span className="text-[#14f195] flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Saved Successfully</span>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-[#1e293b]">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || isSaving}
              className="px-4 py-2 rounded-lg font-bold text-white bg-[#1e293b] hover:bg-[#273549] border border-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-[#1e293b] flex items-center gap-2 text-sm shadow-sm"
            >
              <Undo2 className="w-4 h-4" /> Discard Changes
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isDirty || isSaving}
              className="bg-[#14f195] text-[#0a0f1c] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-500 shadow-[0_4px_12px_rgba(20,241,149,0.15)] text-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <div className="px-2">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 xl:gap-8 items-start relative">
          
          {/* LEFT COLUMN: Main Editor (60%) */}
          <div className="space-y-4 xl:space-y-5">
            
            {/* ABOUT IDENTITY */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <User className="w-4 h-4 text-gray-400" /> About Identity
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subtitle</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleTextChange}
                      placeholder="Discovery"
                      className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Section Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTextChange}
                      placeholder="Beyond the Console"
                      className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lead Text</label>
                    <span className="text-[10px] text-gray-500">{formData.lead.length} characters</span>
                  </div>
                  <textarea
                    name="lead"
                    rows="3"
                    value={formData.lead}
                    onChange={handleTextChange}
                    placeholder="From Enterprise Networking to Cloud Engineering."
                    className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors resize-y"
                  />
                </div>
              </div>
            </div>

            {/* ABOUT STORY */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <FileText className="w-4 h-4 text-gray-400" /> About Story
              </h3>
              
              <div className="space-y-6">
                {formData.paragraphs.length === 0 && (
                  <div className="text-center p-6 border-2 border-dashed border-[#1e293b] rounded-xl text-gray-500 text-sm">
                    No story paragraphs yet.
                  </div>
                )}
                {formData.paragraphs.map((p, idx) => (
                  <div key={idx} className="bg-[#0a0f1c] border border-[#1e293b] rounded-xl overflow-hidden">
                    <div className="bg-[#1e293b]/50 px-4 py-2 flex justify-between items-center border-b border-[#1e293b]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paragraph {String(idx + 1).padStart(2, '0')}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveArrayItem('paragraphs', idx, 'up')} disabled={idx === 0} className="p-1 text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveArrayItem('paragraphs', idx, 'down')} disabled={idx === formData.paragraphs.length - 1} className="p-1 text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-[#1e293b] mx-1"></div>
                        <button type="button" onClick={() => removeArrayItem('paragraphs', idx)} className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors flex items-center gap-1 text-[10px] font-bold uppercase ml-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Text</label>
                        <textarea
                          rows="2"
                          value={p.text || ''}
                          onChange={(e) => handleArrayChange('paragraphs', idx, 'text', e.target.value)}
                          placeholder="I'm a"
                          className="w-full p-2 text-sm bg-[#131b2c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none resize-y"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Highlight</label>
                        <input
                          type="text"
                          value={p.highlight || ''}
                          onChange={(e) => handleArrayChange('paragraphs', idx, 'highlight', e.target.value)}
                          placeholder="Abdelrahman El-bahnsy"
                          className="w-full p-2 text-sm bg-[#131b2c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Suffix</label>
                        <textarea
                          rows="2"
                          value={p.suffix || ''}
                          onChange={(e) => handleArrayChange('paragraphs', idx, 'suffix', e.target.value)}
                          placeholder=", a Computer Science graduate from..."
                          className="w-full p-2 text-sm bg-[#131b2c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none resize-y"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('paragraphs', { text: '', highlight: '', suffix: '' })}
                  className="w-full py-3 border-2 border-dashed border-[#1e293b] rounded-xl text-gray-400 hover:text-white hover:border-gray-500 hover:bg-white/5 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Paragraph
                </button>
              </div>
            </div>

            {/* EXPERTISE BADGES */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <Award className="w-4 h-4 text-gray-400" /> Expertise Badges
              </h3>
              
              <div className="space-y-4">
                {formData.badges.length === 0 && (
                  <div className="text-center p-6 border-2 border-dashed border-[#1e293b] rounded-xl text-gray-500 text-sm">
                    No expertise badges yet.
                  </div>
                )}
                {formData.badges.map((b, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#0a0f1c] p-3 rounded-xl border border-[#1e293b]">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3 w-full">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Icon</label>
                        <input
                          type="text"
                          value={b.icon || ''}
                          onChange={(e) => handleArrayChange('badges', idx, 'icon', e.target.value)}
                          placeholder="fa fa-shield-alt"
                          className="w-full p-2 text-sm bg-[#131b2c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Label</label>
                        <input
                          type="text"
                          value={b.label || ''}
                          onChange={(e) => handleArrayChange('badges', idx, 'label', e.target.value)}
                          placeholder="Networking Mindset"
                          className="w-full p-2 text-sm bg-[#131b2c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-4 sm:pt-0">
                      <button type="button" onClick={() => moveArrayItem('badges', idx, 'up')} disabled={idx === 0} className="p-2 bg-[#1e293b] hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveArrayItem('badges', idx, 'down')} disabled={idx === formData.badges.length - 1} className="p-2 bg-[#1e293b] hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => removeArrayItem('badges', idx)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ml-1" title="Remove"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('badges', { icon: '', label: '' })}
                  className="w-full py-3 border-2 border-dashed border-[#1e293b] rounded-xl text-gray-400 hover:text-white hover:border-gray-500 hover:bg-white/5 transition-colors font-bold text-sm flex items-center justify-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" /> Add Badge
                </button>
              </div>
            </div>

            {/* TECHNICAL PROFILE (TERMINAL) */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <Terminal className="w-4 h-4 text-gray-400" /> Technical Profile
              </h3>
              
              <div className="space-y-3">
                {formData.terminalItems.length === 0 && (
                  <div className="text-center p-6 border-2 border-dashed border-[#1e293b] rounded-xl text-gray-500 text-sm">
                    No technical profile items yet.
                  </div>
                )}
                {formData.terminalItems.length > 0 && (
                  <div className="hidden sm:grid grid-cols-[1fr_2fr_auto] gap-3 px-3 pb-1 border-b border-[#1e293b] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <div>Key</div>
                    <div>Value</div>
                    <div className="w-[104px] text-center">Actions</div>
                  </div>
                )}
                {formData.terminalItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-start sm:items-center bg-[#0a0f1c] sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-[#1e293b] sm:border-none">
                    <div className="w-full">
                      <label className="block sm:hidden text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Key</label>
                      <input
                        type="text"
                        value={item.key || ''}
                        onChange={(e) => handleArrayChange('terminalItems', idx, 'key', e.target.value)}
                        placeholder="role"
                        className="w-full p-2 text-sm bg-[#0a0f1c] sm:bg-[#131b2c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-[#14f195] outline-none font-mono"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block sm:hidden text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Value</label>
                      <input
                        type="text"
                        value={item.value || ''}
                        onChange={(e) => handleArrayChange('terminalItems', idx, 'value', e.target.value)}
                        placeholder="DevOps & Cloud Engineer"
                        className="w-full p-2 text-sm bg-[#0a0f1c] sm:bg-[#131b2c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0 self-end sm:self-auto">
                      <button type="button" onClick={() => moveArrayItem('terminalItems', idx, 'up')} disabled={idx === 0} className="p-2 bg-[#1e293b] hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveArrayItem('terminalItems', idx, 'down')} disabled={idx === formData.terminalItems.length - 1} className="p-2 bg-[#1e293b] hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => removeArrayItem('terminalItems', idx)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ml-1" title="Remove"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('terminalItems', { key: '', value: '' })}
                  className="w-full py-3 border-2 border-dashed border-[#1e293b] rounded-xl text-gray-400 hover:text-white hover:border-gray-500 hover:bg-white/5 transition-colors font-bold text-sm flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-4 h-4" /> Add Technical Item
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Preview (40%) */}
          <div className="sticky top-[100px] pt-0 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto hidden lg:block custom-scrollbar">
            <LivePreview />
          </div>
          
          {/* Mobile Preview */}
          <div className="block lg:hidden mt-8">
            <LivePreview />
          </div>

        </form>
      </div>

    </div>
  );
};

export default memo(AboutManager);
