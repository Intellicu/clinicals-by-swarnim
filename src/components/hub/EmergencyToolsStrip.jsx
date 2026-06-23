import React, { useMemo } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

const EMERGENCY_TOOLS = [
  { id: 'abg', name: 'ABG Interpreter', route: createPageUrl('ABGInterpreter'), description: 'Arterial Blood Gas Analysis' },
  { id: 'aki', name: 'AKI Staging', route: createPageUrl('AKIStager'), description: 'Acute Kidney Injury Risk' },
  { id: 'bp', name: 'BP Percentiles', route: createPageUrl('BPPercentiles'), description: 'Hypertension Emergency Assessment' },
  { id: 'fena', name: 'FENa Calculator', route: createPageUrl('FENaCalculator'), description: 'Fractional Excretion of Sodium' },
  { id: 'potassium', name: 'Potassium Protocol', route: createPageUrl('PotassiumCalculator'), description: 'Hyperkalemia / Hypokalemia management' },
];

const EmergencyToolsStrip = React.forwardRef(({ searchQuery = '', onNavigate, className = '' }, ref) => {
  const orderedTools = useMemo(() => {
    if (!searchQuery.trim()) return EMERGENCY_TOOLS;
    const query = searchQuery.toLowerCase();
    return [...EMERGENCY_TOOLS].sort((a, b) => {
      const aMatch = a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query);
      const bMatch = b.name.toLowerCase().includes(query) || b.description.toLowerCase().includes(query);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [searchQuery]);

  const visibleTools = orderedTools.slice(0, 3);
  const moreCount = orderedTools.length - visibleTools.length;

  return (
    <div ref={ref} className={`w-full bg-gradient-to-r from-red-600 to-red-700 shadow-lg ${className}`}>
      <div className="px-4 py-3 max-w-7xl mx-auto">
        <p className="text-xs font-bold text-white mb-2 uppercase tracking-widest">⚡ Emergency Tools</p>
        <div className="flex gap-2 overflow-x-auto md:flex-wrap md:gap-3 pb-1 md:pb-0">
          {visibleTools.map((tool) => (
            <button key={tool.id} onClick={() => onNavigate?.(tool.route)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white font-semibold text-sm whitespace-nowrap border border-white/30 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              title={tool.description}>
              <AlertCircle className="w-4 h-4" />
              <span>{tool.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
          {moreCount > 0 && (
            <button onClick={() => {}}
              className="flex-shrink-0 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white font-semibold text-sm border border-white/30 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50">
              +{moreCount} More
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

EmergencyToolsStrip.displayName = 'EmergencyToolsStrip';
export default EmergencyToolsStrip;
