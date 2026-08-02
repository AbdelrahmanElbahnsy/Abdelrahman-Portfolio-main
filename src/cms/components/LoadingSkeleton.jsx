import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSkeleton = () => (
  <div className="flex justify-center p-12">
    <Loader2 className="w-10 h-10 animate-spin text-[#14f195]" />
  </div>
);

export default LoadingSkeleton;
