// client/src/components/StatusLegend.tsx
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { STATUS_CONFIG } from '../config/statusConfig';

const StatusLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="flex flex-col items-end">
        {/* Header Pill - Horizontal Expansion */}
        <div 
          className={`
            bg-white shadow-lg border border-gray-200 transition-all duration-300 flex items-center overflow-hidden
            ${isOpen ? 'rounded-t-2xl rounded-b-none w-48 p-1' : 'rounded-full w-12 h-12 p-1'}
          `}
        >
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 px-3' : 'opacity-0 w-0'}`}>
            <h3 className="font-bold text-gray-800 whitespace-nowrap text-sm text-right">מקרא</h3>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`
                rounded-full p-2 transition-colors duration-300
                ${isOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}
              `}
              aria-label={isOpen ? "Close Legend" : "Open Legend"}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Body Content - Vertical Expansion (Drawer) */}
        <div className={`bg-white shadow-lg border border-gray-200 border-t-0 rounded-b-2xl overflow-hidden transition-all duration-300 w-48 ${isOpen ? 'max-h-64 p-4 opacity-100' : 'max-h-0 p-0 opacity-0 border-0'}`}>
          <ul className="space-y-3 text-right">
            {Object.entries(STATUS_CONFIG).map(([key, { label, colorClass }]) => (
              <li key={key} className="flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className={`w-5 h-5 rounded shadow-sm ${colorClass}`}></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatusLegend;
