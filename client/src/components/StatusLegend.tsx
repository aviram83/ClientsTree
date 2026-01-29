// client/src/components/StatusLegend.tsx
import React from 'react';
import { STATUS_CONFIG } from '../config/statusConfig';

const StatusLegend: React.FC = () => {
  const allStatuses = { ...STATUS_CONFIG };

  return (
    <div className="absolute top-20 right-10 bg-white shadow-lg rounded-md p-4 z-20 w-48">
      <h3 className="text-right font-bold mb-2">מקרא</h3>
      <ul className="space-y-2 text-right">
        {Object.entries(allStatuses).map(([key, { label, colorClass }]) => (
          <li key={key} className="flex items-center justify-end">
            <span className="ml-2 pr-2">{label}</span>
            <div className={`w-5 h-5 rounded ${colorClass}`}></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusLegend;
