import React from 'react';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ title }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 font-medium">Dashboard</span>
      <ChevronRight className="w-4 h-4 text-gray-600" />
      <span className="text-white font-semibold">{title}</span>
    </div>
  );
};

export default Breadcrumbs;
