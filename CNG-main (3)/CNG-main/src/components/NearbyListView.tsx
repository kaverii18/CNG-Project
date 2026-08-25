import React, { useState, useMemo } from 'react';
import { CNGStation, FilterOptions, SortOption } from '../types';
import { StationCard } from './StationCard';
import { SmartRecommendationCard } from './SmartRecommendationCard';
import { Search, SlidersHorizontal, ArrowUpDown, Fuel, CheckCircle2, Zap, X, MapPin, Gauge } from 'lucide-react';

interface Props {
  stations: CNGStation[];
  recommendation: {
    station: CNGStation;
    reason: string;
    timeSavedEstimateMinutes: number;
  } | null;
  onSelectStation: (station: CNGStation) => void;
  onNavigate: (station: CNGStation) => void;
  onQuickReport: (station: CNGStation) => void;
  isFavorite: (stationId: string) => boolean;
  onToggleFavorite: (stationId: string) => void;
}

export const NearbyListView: React.FC<Props> = ({
  stations,
  recommendation,
  onSelectStation,
  onNavigate,
  onQuickReport,
  isFavorite,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'uncertain' | 'not_available'>('all');
  const [shortQueueOnly, setShortQueueOnly] = useState<boolean>(false);
  const [highPressureOnly, setHighPressureOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);

  // Filter and sort
  const filteredStations = useMemo(() => {
    let result = [...stations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q)
      );
    }

    if (availabilityFilter !== 'all') {
      result = result.filter(s => s.availability === availabilityFilter);
    }

    if (shortQueueOnly) {
      result = result.filter(s => s.queueLength === 'short' && s.availability === 'available');
    }

    if (highPressureOnly) {
      result = result.filter(s => (s.pressureBar ?? 0) >= 210);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      }
      if (sortBy === 'wait_time') {
        return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
      }
      if (sortBy === 'queue_length') {
        const order = { short: 1, medium: 2, long: 3 };
        return order[a.queueLength] - order[b.queueLength];
      }
      // recommended
      if (a.availability !== b.availability) {
        if (a.availability === 'available') return -1;
        if (b.availability === 'available') return 1;
      }
      return (a.distanceKm ?? 0) + a.estimatedWaitMinutes - ((b.distanceKm ?? 0) + b.estimatedWaitMinutes);
    });

    return result;
  }, [stations, searchQuery, availabilityFilter, shortQueueOnly, highPressureOnly, sortBy]);

  const activeFiltersCount = (availabilityFilter !== 'all' ? 1 : 0) + (shortQueueOnly ? 1 : 0) + (highPressureOnly ? 1 : 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl mx-auto w-full">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          id="input-search-stations"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search CNG station or area (e.g. Nehru Place, Okhla)..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Filter Chips & Sorting */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Sort selector */}
        <div className="relative flex-shrink-0">
          <select
            id="select-sort-by"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="appearance-none pl-7 pr-8 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="distance">📍 Distance (Nearest)</option>
            <option value="wait_time">⏱️ Wait Time (Shortest)</option>
            <option value="recommended">✨ Recommended</option>
            <option value="queue_length">🚗 Queue Length</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Chip: All */}
        <button
          onClick={() => {
            setAvailabilityFilter('all');
            setShortQueueOnly(false);
            setHighPressureOnly(false);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            availabilityFilter === 'all' && !shortQueueOnly && !highPressureOnly
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All ({stations.length})
        </button>

        {/* Filter Chip: Available Only */}
        <button
          onClick={() => setAvailabilityFilter(availabilityFilter === 'available' ? 'all' : 'available')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
            availabilityFilter === 'available'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Available
        </button>

        {/* Filter Chip: Short Queue */}
        <button
          onClick={() => setShortQueueOnly(!shortQueueOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
            shortQueueOnly
              ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-3 h-3 text-blue-600" />
          Short Queue (&lt;15m)
        </button>

        {/* Filter Chip: High Pressure */}
        <button
          onClick={() => setHighPressureOnly(!highPressureOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
            highPressureOnly
              ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Gauge className="w-3 h-3 text-sky-600" />
          High Pressure (&gt;200 bar)
        </button>
      </div>

      {/* Smart Recommendation Card on top */}
      {!searchQuery && availabilityFilter === 'all' && (
        <SmartRecommendationCard
          recommendation={recommendation}
          onSelectStation={onSelectStation}
          onGetDirections={onNavigate}
        />
      )}

      {/* Result Count and Quick Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong className="text-slate-900">{filteredStations.length}</strong> CNG stations sorted by{' '}
          <strong className="capitalize text-blue-600">{sortBy.replace('_', ' ')}</strong>
        </span>
        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              setAvailabilityFilter('all');
              setShortQueueOnly(false);
              setHighPressureOnly(false);
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Station Cards List */}
      {filteredStations.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <Fuel className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">No CNG stations found</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Try adjusting your search query or removing active filters to see all nearby stations.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setAvailabilityFilter('all');
              setShortQueueOnly(false);
              setHighPressureOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800 hover:bg-slate-200"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStations.map(station => (
            <StationCard
              key={station.id}
              station={station}
              isFavorite={isFavorite(station.id)}
              onSelect={onSelectStation}
              onNavigate={onNavigate}
              onQuickReport={onQuickReport}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
