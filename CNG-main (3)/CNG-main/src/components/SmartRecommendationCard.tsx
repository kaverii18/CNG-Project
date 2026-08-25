import React from 'react';
import { CNGStation } from '../types';
import { Sparkles, Navigation, Clock, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { AvailabilityBadge } from './StatusBadges';

interface Props {
  recommendation: {
    station: CNGStation;
    reason: string;
    timeSavedEstimateMinutes: number;
  } | null;
  onSelectStation: (station: CNGStation) => void;
  onGetDirections: (station: CNGStation) => void;
}

export const SmartRecommendationCard: React.FC<Props> = ({
  recommendation,
  onSelectStation,
  onGetDirections
}) => {
  if (!recommendation) return null;

  const { station, reason, timeSavedEstimateMinutes } = recommendation;

  return (
    <div
      id="smart-recommendation-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border border-blue-200/80 p-4 shadow-sm backdrop-blur-md transition-all hover:border-blue-300 hover:shadow-md"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Eyebrow */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-blue-100" />
          Best Option For You
        </div>

        {timeSavedEstimateMinutes > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Zap className="w-3 h-3 text-emerald-600" />
            Saves ~{timeSavedEstimateMinutes} min wait
          </span>
        )}
      </div>

      {/* Main station info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onSelectStation(station)}
            className="text-base font-bold text-slate-900 tracking-tight truncate cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            {station.name}
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {station.address}
          </p>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 uppercase font-medium">Distance</span>
          <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
            <Navigation className="w-3 h-3 text-blue-600" />
            {station.distanceKm} km
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 uppercase font-medium">Wait Time</span>
          <span className="text-sm font-bold text-blue-700 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-blue-600" />
            ~{station.estimatedWaitMinutes} min
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 uppercase font-medium">Status</span>
          <div className="mt-0.5">
            <AvailabilityBadge availability={station.availability} size="sm" />
          </div>
        </div>
      </div>

      {/* Reasoning snippet */}
      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-start gap-2 text-xs text-slate-700">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="text-slate-900 font-semibold">{station.brand}:</strong> {reason}. High dispenser throughput verified by recent driver reports.
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          id="btn-rec-details"
          onClick={() => onSelectStation(station)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
        >
          View Details
        </button>

        <button
          id="btn-rec-navigate"
          onClick={() => onGetDirections(station)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-98"
        >
          <Navigation className="w-3.5 h-3.5" />
          Get Directions
        </button>
      </div>
    </div>
  );
};
