
import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

const CloudflareBadge: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 mt-8 mb-4 opacity-50 select-none">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
            <ShieldCheck size={12} className="text-orange-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Protected by Cloudflare</span>
            <span className="text-gray-300">|</span>
            <Zap size={10} className="text-blue-500 fill-blue-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Global CDN Active</span>
        </div>
        <p className="text-[9px] text-gray-400 font-medium">Safe Node: SIN-01 (Chennai Gateway)</p>
    </div>
  );
};

export default CloudflareBadge;
