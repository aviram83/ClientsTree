// client/src/components/LegendContent.tsx
import React from 'react';
import { STATUS_CONFIG } from '../config/statusConfig';

const LegendContent: React.FC = () => {
  return (
    <ul className="space-y-3 text-right">
      {Object.entries(STATUS_CONFIG).map(([key, { label, colorClass }]) => (
        <li key={key} className="flex items-center justify-end gap-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={`w-5 h-5 rounded shadow-sm ${colorClass}`}></div>
        </li>
      ))}
    </ul>
  );
};

export default LegendContent;
