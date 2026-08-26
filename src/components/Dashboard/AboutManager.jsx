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
    <div className="w-full flex flex-col bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-xl">
      <div className="mb-8">
        <span className="text-[#14f195] font-mono uppercase tracking-widest text-[10px] mb-2 block">
          {formData.subtitle || 'Subtitle'}
        </span>
        <h2 className="text-3xl font-black text-white leading-tight">{formData.title || 'Section Title'}</h2>
      </div>

      <div className="flex flex-col gap-8">
        {formData.terminalItems.length > 0 && (
          <div className="w-full rounded-2xl overflow-hidden border border-[#1e293b] shadow-lg bg-[#0a0f1c]">
            <div className="bg-[#1e293b]/50 p-3 flex items-center gap-3 border-b border-[#1e293b]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                <span className="w-2 h-2 rounded-full bg-[#eab308]"></span>
                <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              </div>
              <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">{personalInfo.terminalTitle || 'Terminal'}</span>
            </div>
            <div className="p-4 font-mono text-[11px] leading-relaxed">
              <ul className="space-y-3">
                {formData.terminalItems.map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
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
        )}

        <div className="flex flex-col gap-6">
          {formData.lead && (
            <p className="text-lg font-bold text-white border-l-2 border-[#14f195] pl-4 py-1 bg-[#14f195]/5">
              {formData.lead}
            </p>
          )}
          
          <div className="space-y-4">
            {formData.paragraphs.map((p, idx) => (
              <p key={idx} className="text-gray-400 text-sm leading-relaxed">
                {p.text}{' '}
                {p.highlight && <strong className="text-white">{p.highlight}</strong>}{' '}
                {p.suffix}
              </p>
            ))}
          </div>

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
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-16 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-10 px-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            About Section
          </h1>
          <p className="text-gray-400 mt-1 text-sm max-w-lg">
            Manage the story, expertise highlights, and technical profile displayed in the public About section.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0f172a] p-2 pr-2 pl-4 rounded-xl border border-[#1e293b]">
          <div className="text-xs font-bold uppercase tracking-wider mr-2">
            {saveStatus === 'saved' && <span className="text-gray-500">✓ All changes saved</span>}
            {saveStatus === 'unsaved' && <span className="text-orange-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> Unsaved changes</span>}
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
              Discard Changes
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

      <form onSubmit={handleSubmit} className="px-2 grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-10 items-start">
        
        {/* MAIN EDITOR (70%) */}
        <div className="space-y-8 max-w-4xl">
          
          {/* ABOUT IDENTITY */}
          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">About Identity</h3>
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-[#1e293b] space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleTextChange}
                    className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Section Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTextChange}
                    className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
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
                  rows="3"
                  value={formData.lead}
                  onChange={handleTextChange}
                  className="w-full p-3 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors resize-y leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* ABOUT STORY */}
          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">About Story</h3>
            <div className="space-y-3">
              {formData.paragraphs.length === 0 && (
                <div className="p-6 border border-dashed border-[#1e293b] rounded-xl text-gray-500 text-sm text-center">
                  No story paragraphs yet.
                </div>
              )}
              {formData.paragraphs.map((p, idx) => {
                const isExpanded = expandedParagraph === idx;
                const summary = p.text ? (p.text.length > 50 ? p.text.substring(0, 50) + '...' : p.text) : 'Empty paragraph...';
                
                return (
                  <div key={idx} className={`border rounded-xl transition-colors ${isExpanded ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#0a0f1c] border-transparent hover:border-[#1e293b]'}`}>
                    {/* Accordion Header */}
                    <div 
                      className="px-5 py-3.5 flex justify-between items-center cursor-pointer group"
                      onClick={() => setExpandedParagraph(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center gap-4 overflow-hidden pr-4">
                        <span className="text-[10px] font-mono font-bold text-[#14f195]">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="text-sm text-gray-300 truncate font-medium">{summary}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => moveArrayItem('paragraphs', idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveArrayItem('paragraphs', idx, 'down')} disabled={idx === formData.paragraphs.length - 1} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                        <button type="button" onClick={() => removeArrayItem('paragraphs', idx)} className="p-1.5 text-gray-500 hover:text-red-400 ml-2"><X className="w-4 h-4" /></button>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-[#1e293b]/50 space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Text</label>
                          <textarea
                            rows="2"
                            value={p.text || ''}
                            onChange={(e) => handleArrayChange('paragraphs', idx, 'text', e.target.value)}
                            className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Highlight</label>
                          <input
                            type="text"
                            value={p.highlight || ''}
                            onChange={(e) => handleArrayChange('paragraphs', idx, 'highlight', e.target.value)}
                            className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Suffix</label>
                          <textarea
                            rows="2"
                            value={p.suffix || ''}
                            onChange={(e) => handleArrayChange('paragraphs', idx, 'suffix', e.target.value)}
                            className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none resize-y"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <button
                type="button"
                onClick={() => addArrayItem('paragraphs', { text: '', highlight: '', suffix: '' })}
                className="w-full py-3.5 border border-dashed border-[#1e293b] rounded-xl text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#0f172a] transition-colors font-bold text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Paragraph
              </button>
            </div>
          </section>

          {/* EXPERTISE BADGES */}
          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Expertise Badges</h3>
            <div className="space-y-2">
              {formData.badges.length === 0 && (
                <div className="p-6 border border-dashed border-[#1e293b] rounded-xl text-gray-500 text-sm text-center">
                  No expertise badges yet.
                </div>
              )}
              {formData.badges.map((b, idx) => (
                <div key={idx} className="flex gap-3 items-center group">
                  <div className="flex-grow grid grid-cols-[1fr_2fr] gap-3">
                    <input
                      type="text"
                      value={b.icon || ''}
                      onChange={(e) => handleArrayChange('badges', idx, 'icon', e.target.value)}
                      placeholder="Icon (e.g. fa fa-shield-alt)"
                      className="w-full p-2 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-gray-400 font-mono outline-none"
                    />
                    <input
                      type="text"
                      value={b.label || ''}
                      onChange={(e) => handleArrayChange('badges', idx, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-full p-2 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white font-bold outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => moveArrayItem('badges', idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveArrayItem('badges', idx, 'down')} disabled={idx === formData.badges.length - 1} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => removeArrayItem('badges', idx)} className="p-1.5 text-gray-500 hover:text-red-400 ml-1"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('badges', { icon: '', label: '' })}
                className="py-2.5 px-4 text-gray-400 hover:text-white transition-colors font-bold text-sm flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Badge
              </button>
            </div>
          </section>

          {/* TECHNICAL PROFILE */}
          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Technical Profile</h3>
            <div className="space-y-2">
              {formData.terminalItems.length === 0 && (
                <div className="p-6 border border-dashed border-[#1e293b] rounded-xl text-gray-500 text-sm text-center">
                  No technical profile items yet.
                </div>
              )}
              {formData.terminalItems.length > 0 && (
                <div className="grid grid-cols-[1fr_2.5fr_100px] gap-3 px-1 pb-2 border-b border-[#1e293b] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div>Key</div>
                  <div>Value</div>
                  <div className="text-center">Action</div>
                </div>
              )}
              {formData.terminalItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_2.5fr_100px] gap-3 items-center group">
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
                  <div className="flex justify-center items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => moveArrayItem('terminalItems', idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveArrayItem('terminalItems', idx, 'down')} disabled={idx === formData.terminalItems.length - 1} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => removeArrayItem('terminalItems', idx)} className="p-1.5 text-gray-500 hover:text-red-400 ml-1"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('terminalItems', { key: '', value: '' })}
                className="py-2.5 px-4 text-gray-400 hover:text-white transition-colors font-bold text-sm flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Technical Item
              </button>
            </div>
          </section>

        </div>

        {/* PREVIEW COLUMN (30%) */}
        <div className="lg:sticky lg:top-[100px]">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Live Preview</h3>
          <LivePreview />
        </div>

      </form>
    </div>
  );
};

export default memo(AboutManager);
