import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

export const HelpCenterPage: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className={`text-2xl font-bold text-${theme}-600`}>Help Center</h1>
      <div className="card space-y-3">
        <p className="text-gray-700">Frequently asked questions and quick contacts.</p>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>How to install the app: Use your browser’s install option (Add to Home Screen).</li>
          <li>Reports offline: You can create daily/weekly reports while offline; they’ll sync when online.</li>
          <li>Billing support: Submit receipt on the Billing page and contact us via WhatsApp.</li>
        </ul>
      </div>
      <div className="card space-y-2">
        <h2 className="font-semibold">Contact</h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Email</span>
          <a className={`text-${theme}-600 underline`} href="mailto:support@mipt.app">support@mipt.app</a>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">WhatsApp</span>
          <a className={`text-${theme}-600 underline`} href={`https://wa.me/255712345678`} target="_blank" rel="noreferrer">+255 712 345 678</a>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;



