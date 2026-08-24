// client/src/components/LegendContent.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { STATUS_CONFIG } from '../config/statusConfig';

const LegendContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ul className="space-y-3 text-right">
      {Object.entries(STATUS_CONFIG).map(([key, { labelKey, colorClass }]) => (
        <li key={key} className="flex items-center justify-end gap-2">
          <span className="text-sm font-medium text-muted-foreground">{t(labelKey)}</span>
          <div className={`w-5 h-5 rounded shadow-sm ${colorClass}`}></div>
        </li>
      ))}
    </ul>
  );
};

export default LegendContent;
