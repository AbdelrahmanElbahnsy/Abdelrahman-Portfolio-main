import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center shadow-2xl">
            <ShieldAlert className="w-8 h-8 text-emerald-500 opacity-80" />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
          System Maintenance
        </h1>
        
        <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
          The public portfolio is currently undergoing scheduled maintenance. 
          Please check back shortly.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] border border-[#222]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Status: Offline</span>
        </div>
      </div>
    </div>
  );
}
