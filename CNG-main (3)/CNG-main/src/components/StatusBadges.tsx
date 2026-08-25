import React from 'react';
import { CNGAvailability, QueueLength } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Gauge, Car } from 'lucide-react';

export const AvailabilityBadge: React.FC<{ availability: CNGAvailability; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  availability,
  size = 'md',
  className = ''
}) => {
  if (availability === 'available') {
    return (
      <span
        id={`badge-available-${size}`}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5 text-emerald-600'} />
        CNG Available
      </span>
    );
  }

  if (availability === 'uncertain') {
    return (
      <span
        id={`badge-uncertain-${size}`}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5 text-amber-600'} />
        Uncertain / Low Info
      </span>
    );
  }

  return (
    <span
      id={`badge-unavailable-${size}`}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <XCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5 text-rose-600'} />
      Not Available
    </span>
  );
};

export const QueueBadge: React.FC<{ queueLength: QueueLength; waitMinutes: number; queueCount?: number; size?: 'sm' | 'md' }> = ({
  queueLength,
  waitMinutes,
  queueCount,
  size = 'md'
}) => {
  const getStyle = () => {
    switch (queueLength) {
      case 'short':
        return {
          bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Short Queue'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50/90 border-amber-200 text-amber-900',
          dot: 'bg-amber-500',
          label: 'Medium Queue'
        };
      case 'long':
        return {
          bg: 'bg-rose-50/90 border-rose-200 text-rose-900',
          dot: 'bg-rose-500',
          label: 'Long Queue'
        };
    }
  };

  const config = getStyle();

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 shadow-xs ${config.bg} ${
        size === 'sm' ? 'text-xs' : 'text-xs'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className="font-semibold">{config.label}</span>
      </div>
      <span className="text-slate-300">•</span>
      <div className="flex items-center gap-1 text-slate-700 font-medium">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>~{waitMinutes}m wait</span>
      </div>
      {typeof queueCount === 'number' && queueCount > 0 && (
        <>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1 text-slate-600">
            <Car className="w-3 h-3 text-slate-500" />
            <span>{queueCount} cars</span>
          </div>
        </>
      )}
    </div>
  );
};

export const PressureBadge: React.FC<{ pressureBar?: number; size?: 'sm' | 'md' }> = ({
  pressureBar,
  size = 'md'
}) => {
  if (!pressureBar) return null;

  const isHigh = pressureBar >= 210;
  const isMedium = pressureBar >= 190 && pressureBar < 210;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-mono font-medium ${
        isHigh
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : isMedium
          ? 'bg-sky-50 text-sky-700 border border-sky-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200'
      }`}
      title={`${pressureBar} Bar pressure`}
    >
      <Gauge className={size === 'sm' ? 'w-3 h-3 text-blue-600' : 'w-3.5 h-3.5 text-blue-600'} />
      <span>{pressureBar} bar</span>
      {isHigh && <span className="text-[10px] uppercase font-sans font-bold text-blue-700 bg-blue-100 px-1 rounded">High</span>}
    </div>
  );
};
