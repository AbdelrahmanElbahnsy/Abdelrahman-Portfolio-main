import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, XCircle, Info } from 'lucide-react';

const EnterpriseStatusBadge = ({ status, type = 'info', className = '' }) => {
  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-400',
          icon: <CheckCircle2 className="w-3 h-3 mr-1.5" />
        };
      case 'warning':
        return {
          bg: 'bg-cms-warning/10',
          border: 'border-cms-warning/20',
          text: 'text-cms-warning',
          icon: <AlertTriangle className="w-3 h-3 mr-1.5" />
        };
      case 'error':
      case 'danger':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          icon: <XCircle className="w-3 h-3 mr-1.5" />
        };
      case 'pending':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
          icon: <Clock className="w-3 h-3 mr-1.5" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-white/10',
          border: 'border-white/20',
          text: 'text-gray-300',
          icon: <Info className="w-3 h-3 mr-1.5" />
        };
    }
  };

  const style = getStyle();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.border} ${style.text} ${className}`}>
      {style.icon}
      {status}
    </span>
  );
};

export default EnterpriseStatusBadge;
