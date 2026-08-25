import React from 'react';
import { CNGStation } from '../types';
import { AvailabilityBadge, QueueBadge, PressureBadge } from './StatusBadges';
import { Navigation, Clock, MessageSquarePlus, Heart, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';
import { formatTimeAgo } from '../data/mockStations';

interface Props {
  station: CNGStation;
  isFavorite?: boolean;
  onSelect: (station: CNGStation) => void;
  onNavigate: (station: CNGStation) => void;
  onQuickReport: (station: CNGStation) => void;
  onToggleFavorite?: (stationId: string) => void;
}

export const StationCard: React.FC<Props> = ({
  station,
  isFavorite = false,
  onSelect,
  onNavigate,
  onQuickReport,
  onToggleFavorite
}) => {
  return (
    <div
      id={`station-card-${station.id}`}
      className="group relative rounded-2xl bg-white border border-slate-200/90 p-4 transition-all hover:border-slate-300 hover:shadow-md shadow-xs backdrop-blur-sm"
    >
      {/* Top Header: Brand badge + Favorite + Distance */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
            {station.brand}
          </span>
          {station.pressureBar && <PressureBadge pressureBar={station.pressureBar} size="sm" />}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-blue-600" />
            {station.distanceKm} km
          </span>

          {onToggleFavorite && (
            <button
              id={`btn-fav-${station.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(station.id);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Station Name & Area */}
      <div className="cursor-pointer" onClick={() => onSelect(station)}>
        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
          <span className="truncate">{station.name}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
        </h4>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>{station.address}</span>
        </p>
      </div>

      {/* Live Status Indicators */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <AvailabilityBadge availability={station.availability} size="sm" />
        {station.availability !== 'not_available' && (
          <QueueBadge
            queueLength={station.queueLength}
            waitMinutes={station.estimatedWaitMinutes}
            queueCount={station.queueCount}
            size="sm"
          />
        )}
      </div>

      {/* Meta details: Dispensers, verified count, last updated */}
      <div className="flex items-center justify-between gap-2 mt-2.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Updated {formatTimeAgo(station.lastUpdated)}</span>
          {station.lastUpdatedBy && (
            <span className="text-slate-500 truncate max-w-[120px]">
              • {station.lastUpdatedBy}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-emerald-700 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{station.verifiedReportsCount} reports</span>
        </div>
      </div>

      {/* Bottom Action buttons */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100">
        <button
          id={`btn-details-${station.id}`}
          onClick={() => onSelect(station)}
          className="col-span-1 py-1.5 px-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all text-center"
        >
          Details
        </button>

        <button
          id={`btn-report-${station.id}`}
          onClick={() => onQuickReport(station)}
          className="col-span-1 py-1.5 px-2 text-xs font-semibold rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center justify-center gap-1"
        >
          <MessageSquarePlus className="w-3 h-3" />
          Report
        </button>

        <button
          id={`btn-navigate-${station.id}`}
          onClick={() => onNavigate(station)}
          className="col-span-1 py-1.5 px-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1 shadow-xs font-bold active:scale-98"
        >
          <Navigation className="w-3 h-3" />
          Navigate
        </button>
      </div>
    </div>
  );
};
