import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { personalInfo } from '../../data/portfolioData';
import { 
  Loader2, Save, Undo2, ChevronDown, ChevronUp, Plus, X
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
  const [saveStatus, setSaveStatus] = useState('saved'); 
  const [expandedParagraph, setExpandedParagraph] = useState(0);

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
      setIsDirty(true);
      setSaveStatus('unsaved');
      return { ...prev, [name]: value };
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
      const newArray = [...prev[arrayName], template];
      if (arrayName === 'paragraphs') {
        setExpandedParagraph(newArray.length - 1);
      }
      return { ...prev, [arrayName]: newArray };
    });
  }, []);

  const removeArrayItem = useCallback((arrayName, index) => {
    setFormData(prev => {
      const newArray = prev[arrayName].filter((_, i) => i !== index);
      setIsDirty(true);
      setSaveStatus('unsaved');
      return { ...prev, [arrayName]: newArray };
    });
    
    if (arrayName === 'paragraphs' && expandedParagraph === index) {
      setExpandedParagraph(0);
    }
  }, [expandedParagraph]);

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
    
    if (arrayName === 'paragraphs' && expandedParagraph === index) {
      setExpandedParagraph(direction === 'up' ? index - 1 : index + 1);
    }
  }, [expandedParagraph]);

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
        toast.error(`Technical Item ${i + 1} is missing a key or value.`);
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
      setTimeout(() => setSaveStatus('saved'), 3000);
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

  const LivePreview = () => (
    <div className="w-full flex flex-col bg-[#0a0f1c] rounded-2xl border border-[#1e293b] p-6 shadow-xl relative overflow-hidden">
      <div className="mb-6">
        <span className="text-[#14f195] font-mono uppercase tracking-widest text-[10px] mb-2 block">
          {formData.subtitle || 'Subtitle'}
        </span>
        <h2 className="text-2xl font-black text-white leading-tight">{formData.title || 'Section Title'}</h2>
      </div>

      <div className="flex flex-col gap-8 items-start">
        {formData.terminalItems.length > 0 && (
          <div className="w-full rounded-xl overflow-hidden border border-[#1e293b] shadow-lg bg-[#0f172a]">
            <div className="bg-[#1e293b]/30 p-2.5 flex items-center gap-2.5 border-b border-[#1e293b]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
              </div>
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">{personalInfo.terminalTitle || 'Terminal'}</span>
            </div>
            <div className="p-4 font-mono text-[10px] leading-relaxed">
              <ul className="space-y-2.5">
                {formData.terminalItems.map((item, idx) => (
                  <li key={idx} className="flex flex-col sm:flex-row gap-1 sm:gap-3 items-start">
                    <span className="text-[#14f195] shrink-0 font-bold">{item.key || 'key'}:</span>
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
        )}

        <div className="flex flex-col gap-6">
          {formData.lead && (
            <p className="text-base font-bold text-white border-l-4 border-[#14f195] pl-4 py-1.5 bg-[#14f195]/5 leading-snug">
              {formData.lead}
            </p>
          )}
          
          <div className="space-y-4">
            {formData.paragraphs.map((p, idx) => (
              <p key={idx} className="text-gray-300 text-sm leading-relaxed">
                {p.text}{' '}
                {p.highlight && <strong className="text-white font-semibold">{p.highlight}</strong>}{' '}
                {p.suffix}
              </p>
            ))}
          </div>

          {formData.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.badges.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#131b2c] border border-blue-900/30 text-[10px] font-bold text-gray-300 shadow-sm">
                  <i className={`${b.icon} text-[#14f195] text-sm`}></i> {b.label || 'Badge'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1800px] mx-auto pb-24 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 px-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            About Section
          </h1>
          <p className="text-gray-400 mt-1 text-sm max-w-lg">
            Manage the complete About section displayed on the public portfolio.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider mr-2">
            {saveStatus === 'saved' && <span className="text-gray-500">✓ All Changes Saved</span>}
            {saveStatus === 'unsaved' && <span className="text-orange-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> Unsaved Changes</span>}
            {saveStatus === 'saving' && <span className="text-blue-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
            {saveStatus === 'success' && <span className="text-[#14f195]">✓ Saved Successfully</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || isSaving}
              className="px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-[#1e293b] transition-colors disabled:opacity-30 text-sm"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isDirty || isSaving}
              className="bg-[#14f195] text-[#0a0f1c] px-5 py-2 rounded-lg font-bold hover:bg-[#10d482] transition-colors disabled:opacity-50 disabled:bg-[#1e293b] disabled:text-gray-500 text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-2 flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        
        {/* MAIN EDITOR (75%) */}
        <div className="flex-1 w-full lg:w-[75%] min-w-0 bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 sm:p-10 shadow-xl">
          
          {/* ABOUT IDENTITY */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0">About Identity</span>
              <div className="h-px bg-[#1e293b] flex-1"></div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleTextChange}
                    className="w-full p-3 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Section Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTextChange}
                    className="w-full p-3 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lead Text</label>
                  <span className="text-[10px] text-gray-500">{formData.lead.length} chars</span>
                </div>
                <textarea
                  name="lead"
                  rows="2"
                  value={formData.lead}
                  onChange={handleTextChange}
                  className="w-full p-3 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors resize-y leading-relaxed font-medium"
                />
              </div>
            </div>
          </div>

          {/* ABOUT STORY */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0">About Story</span>
              <div className="h-px bg-[#1e293b] flex-1"></div>
            </div>

            <div className="space-y-0">
              {formData.paragraphs.length === 0 && (
                <div className="py-8 text-gray-500 text-sm text-center">
                  No story paragraphs yet.
                </div>
              )}
              {formData.paragraphs.map((p, idx) => (
                <div key={idx} className="relative group">
                  <div className="flex items-start gap-4 py-4">
                    <div className="flex-1 flex flex-col gap-1.5 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center bg-[#0a0f1c] border border-[#1e293b] hover:border-gray-700 focus-within:border-[#14f195] rounded-lg overflow-hidden transition-colors">
                        <span className="w-full sm:w-20 shrink-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center border-b sm:border-b-0 sm:border-r border-[#1e293b] py-2 sm:py-3 bg-[#0f172a]/50">Prefix</span>
                        <textarea
                          rows="1"
                          value={p.text || ''}
                          onChange={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                            handleArrayChange('paragraphs', idx, 'text', e.target.value);
                          }}
                          className="flex-1 w-full min-w-0 p-3 text-sm bg-transparent text-gray-400 outline-none resize-none overflow-hidden"
                          placeholder="E.g. I'm..."
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center bg-[#0a0f1c] border border-[#1e293b] hover:border-gray-700 focus-within:border-[#14f195] rounded-lg overflow-hidden transition-colors">
                        <span className="w-full sm:w-20 shrink-0 text-[10px] font-bold text-[#14f195] uppercase tracking-wider text-center border-b sm:border-b-0 sm:border-r border-[#1e293b] py-2 sm:py-3 bg-[#14f195]/5">Highlight</span>
                        <textarea
                          rows="1"
                          value={p.highlight || ''}
                          onChange={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                            handleArrayChange('paragraphs', idx, 'highlight', e.target.value);
                          }}
                          className="flex-1 w-full min-w-0 p-3 text-sm bg-transparent text-white font-bold outline-none resize-none overflow-hidden"
                          placeholder="E.g. Abdelrahman El-bahnsy"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center bg-[#0a0f1c] border border-[#1e293b] hover:border-gray-700 focus-within:border-[#14f195] rounded-lg overflow-hidden transition-colors">
                        <span className="w-full sm:w-20 shrink-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center border-b sm:border-b-0 sm:border-r border-[#1e293b] py-2 sm:py-3 bg-[#0f172a]/50">Suffix</span>
                        <textarea
                          rows="3"
                          value={p.suffix || ''}
                          onChange={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                            handleArrayChange('paragraphs', idx, 'suffix', e.target.value);
                          }}
                          className="flex-1 w-full min-w-0 p-3 text-sm bg-transparent text-gray-400 outline-none resize-none overflow-hidden leading-relaxed"
                          placeholder="E.g. , a Computer Science graduate..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 shrink-0">
                      <button type="button" onClick={() => moveArrayItem('paragraphs', idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 bg-[#131b2c] rounded border border-[#1e293b]"><ChevronUp className="w-3 h-3" /></button>
                      <button type="button" onClick={() => moveArrayItem('paragraphs', idx, 'down')} disabled={idx === formData.paragraphs.length - 1} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 bg-[#131b2c] rounded border border-[#1e293b]"><ChevronDown className="w-3 h-3" /></button>
                      <button type="button" onClick={() => removeArrayItem('paragraphs', idx)} className="p-1.5 text-red-400/70 hover:text-red-400 bg-[#131b2c] rounded border border-[#1e293b] mt-2"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                  {idx < formData.paragraphs.length - 1 && (
                    <div className="h-px w-full bg-[#1e293b]/60 my-4"></div>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('paragraphs', { text: '', highlight: '', suffix: '' })}
                className="w-full mt-4 py-3.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#131b2c] transition-colors font-bold text-sm flex items-center justify-center gap-2 border border-transparent hover:border-[#1e293b]"
              >
                <Plus className="w-4 h-4" /> Add Story Paragraph
              </button>
            </div>
          </div>

          {/* EXPERTISE BADGES */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Expertise Badges</span>
              <div className="h-px bg-[#1e293b] flex-1"></div>
            </div>

            <div className="space-y-1">
              {formData.badges.length === 0 && (
                <div className="py-4 text-gray-500 text-sm text-center">
                  No expertise badges yet.
                </div>
              )}
              {formData.badges.map((b, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:items-center group py-2 sm:py-1 border-b border-[#1e293b]/50 sm:border-0">
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={b.icon || ''}
                      onChange={(e) => handleArrayChange('badges', idx, 'icon', e.target.value)}
                      placeholder="Icon class"
                      className="w-full p-2 text-sm bg-[#0a0f1c] border border-[#1e293b] hover:border-gray-700 focus:border-[#14f195] rounded-lg text-gray-400 font-mono outline-none transition-colors"
                    />
                    <input
                      type="text"
                      value={b.label || ''}
                      onChange={(e) => handleArrayChange('badges', idx, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-full p-2 text-sm bg-[#0a0f1c] border border-[#1e293b] hover:border-gray-700 focus:border-[#14f195] rounded-lg text-white font-bold outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1 sm:gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-1 sm:mt-0">
                    <button type="button" onClick={() => moveArrayItem('badges', idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveArrayItem('badges', idx, 'down')} disabled={idx === formData.badges.length - 1} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => removeArrayItem('badges', idx)} className="p-1.5 text-gray-500 hover:text-red-400 ml-1"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('badges', { icon: '', label: '' })}
                className="py-2.5 px-3 text-gray-400 hover:text-white hover:bg-[#131b2c] rounded-lg transition-colors font-bold text-sm flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Badge
              </button>
            </div>
          </div>

          {/* TECHNICAL PROFILE */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Technical Profile</span>
              <div className="h-px bg-[#1e293b] flex-1"></div>
            </div>

            <div className="space-y-1">
              {formData.terminalItems.length === 0 && (
                <div className="py-4 text-gray-500 text-sm text-center">
                  No technical profile items yet.
                </div>
              )}
              {formData.terminalItems.length > 0 && (
                <div className="hidden sm:grid sm:grid-cols-[150px_1fr_80px] gap-3 px-1 pb-2 border-b border-[#1e293b] text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <div>Key</div>
                  <div>Value</div>
                  <div className="text-center">Action</div>
                </div>
              )}
              {formData.terminalItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:grid sm:grid-cols-[150px_1fr_80px] gap-2 sm:gap-3 sm:items-center group py-3 sm:py-1 border-b border-[#1e293b]/50 sm:border-0">
                  <input
                    type="text"
                    value={item.key || ''}
                    onChange={(e) => handleArrayChange('terminalItems', idx, 'key', e.target.value)}
                    placeholder="key"
                    className="w-full p-2 text-sm bg-[#0a0f1c] border border-transparent hover:border-[#1e293b] focus:border-[#14f195] focus:bg-[#131b2c] rounded-lg text-[#14f195] font-mono outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) => handleArrayChange('terminalItems', idx, 'value', e.target.value)}
                    placeholder="value"
                    className="w-full p-2 text-sm bg-[#0a0f1c] border border-transparent hover:border-[#1e293b] focus:border-[#14f195] focus:bg-[#131b2c] rounded-lg text-white font-mono outline-none transition-colors"
                  />
                  <div className="flex justify-end sm:justify-center items-center gap-1 sm:gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-1 sm:mt-0">
                    <button type="button" onClick={() => moveArrayItem('terminalItems', idx, 'up')} disabled={idx === 0} className="p-1 text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveArrayItem('terminalItems', idx, 'down')} disabled={idx === formData.terminalItems.length - 1} className="p-1 text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => removeArrayItem('terminalItems', idx)} className="p-1 text-gray-500 hover:text-red-400 ml-1"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('terminalItems', { key: '', value: '' })}
                className="py-2.5 px-3 text-gray-400 hover:text-white hover:bg-[#131b2c] rounded-lg transition-colors font-bold text-sm flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Technical Item
              </button>
            </div>
          </div>

        </div>

        {/* PREVIEW COLUMN (25%) */}
        <div className="w-full lg:w-[25%] lg:min-w-[320px] lg:max-w-[380px] shrink-0 lg:sticky lg:top-[100px]">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Live Preview</h3>
          <LivePreview />
        </div>

      </form>
    </div>
  );
};

export default memo(AboutManager);
