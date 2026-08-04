import React, { useState } from 'react';
import { runMigration } from '../../cms/migrations/runMigration';

const DeveloperTools = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  if (!import.meta.env.DEV) {
    return null;
  }

  const handleMigration = async (target) => {
    setLoading(true);
    setResults(null);
    try {
      const res = await runMigration(target);
      setResults({ target, data: res });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const buttons = [
    { label: 'Seed Hero', target: 'hero' },
    { label: 'Seed About', target: 'about' },
    { label: 'Seed Skills', target: 'skills' },
    { label: 'Seed Journey', target: 'journey' },
    { label: 'Seed Projects', target: 'projects' },
    { label: 'Seed Certifications', target: 'certifications' },
    { label: 'Seed Socials', target: 'socials' },
    { label: 'Seed Contact', target: 'contact' },
    { label: 'Seed Profile', target: 'profile' },
    { label: 'Seed Navbar', target: 'navbar' },
    { label: 'Seed All', target: 'all' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Developer Tools (DEV ONLY)</h2>
        <p className="text-gray-400">Use these migration utilities to seed initial data into Firestore.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {buttons.map((btn) => (
          <button
            key={btn.target}
            onClick={() => handleMigration(btn.target)}
            disabled={loading}
            className="px-4 py-3 bg-[#131b2c] hover:bg-[#1e293b] border border-[#1e293b] hover:border-[#14f195] text-white rounded-xl transition-all font-semibold disabled:opacity-50"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-[#14f195] animate-pulse">Running migration...</div>
      )}

      {results && !loading && (
        <div className="mt-8 p-6 bg-[#131b2c] border border-[#1e293b] rounded-2xl">
          <h3 className="text-xl font-semibold mb-4 text-[#14f195]">Migration Results: {results.target}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-[#0a0f1c] rounded-xl border border-[#1e293b]">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Created</p>
              <p className="text-2xl font-bold text-white">{results.data?.created || 0}</p>
            </div>
            <div className="p-4 bg-[#0a0f1c] rounded-xl border border-[#1e293b]">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Updated</p>
              <p className="text-2xl font-bold text-[#14f195]">{results.data?.updated || 0}</p>
            </div>
            <div className="p-4 bg-[#0a0f1c] rounded-xl border border-[#1e293b]">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Skipped</p>
              <p className="text-2xl font-bold text-gray-400">{results.data?.skipped || 0}</p>
            </div>
            <div className="p-4 bg-[#0a0f1c] rounded-xl border border-red-500/20">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-500">{results.data?.failed || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperTools;
