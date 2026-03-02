// client/src/components/StatusLegend.tsx
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { STATUS_CONFIG } from '../config/statusConfig';

const StatusLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Render FAB (Closed State)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-gray-50 transition-all active:scale-95"
        aria-label="Open Legend"
      >
        <Menu size={24} />
      </button>
    );
  }

  // Render Legend Card (Opened State)
  return (
    <div className="absolute top-4 right-4 bg-white shadow-2xl rounded-md p-4 z-50 w-48 transition-all">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          aria-label="Close Legend"
        >
          <X size={20} />
        </button>
        <h3 className="font-bold text-gray-800">מקרא</h3>
      </div>

      <ul className="space-y-3 text-right">
        {Object.entries(STATUS_CONFIG).map(([key, { label, colorClass }]) => (
          <li key={key} className="flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className={`w-5 h-5 rounded shadow-sm ${colorClass}`}></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusLegend;
