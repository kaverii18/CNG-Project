import React from 'react';
import { CNGStation } from '../types';
import { AvailabilityBadge } from './StatusBadges';
import { X, Navigation, ExternalLink, Clock, MapPin, Car, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  station: CNGStation | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number; areaName: string };
}

export const DirectionsModal: React.FC<Props> = ({
  station,
  isOpen,
  onClose,
  userLocation
}) => {
  if (!isOpen || !station) return null;

  const totalTime = (station.drivingEtaMinutes || 5) + (station.availability === 'not_available' ? 0 : station.estimatedWaitMinutes);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${station.latitude},${station.longitude}&travelmode=driving`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="directions-modal"
        className="w-full max-w-lg max-h-[90vh] bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Route & Trip ETA</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px] sm:max-w-sm">{station.name}</p>
            </div>
          </div>

          <button
            id="btn-close-directions"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Total Turnaround summary banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Total Turnaround Time
              </span>
              <AvailabilityBadge availability={station.availability} size="sm" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">~{totalTime}</span>
              <span className="text-sm font-bold text-blue-600">Minutes Total</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Car className="w-4 h-4 text-blue-600" />
                <span>Drive: <strong>~{station.drivingEtaMinutes} min</strong> ({station.distanceKm} km)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>CNG Queue: <strong>~{station.estimatedWaitMinutes} min</strong></span>
              </div>
            </div>
          </div>

          {/* Route path diagram */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Trip Pathway
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Origin */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-1 ring-blue-600" />
                <span className="text-xs font-bold text-slate-900">Current Location</span>
                <p className="text-[11px] text-slate-500">{userLocation.areaName}</p>
              </div>

              {/* Waypoint: Traffic status */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white" />
                <span className="text-xs text-slate-700">Transit via Ring Road / Main Corridor</span>
                <p className="text-[11px] text-emerald-700">Normal traffic flow (~{station.distanceKm} km)</p>
              </div>

              {/* Destination */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-600" />
                <span className="text-xs font-bold text-slate-900">{station.name}</span>
                <p className="text-[11px] text-slate-500">{station.address}</p>
              </div>
            </div>
          </div>

          {/* Tips for this station */}
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-xs text-slate-700 space-y-1.5">
            <span className="font-bold text-blue-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Driver Entry Guidance:
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {station.hasDedicatedAutoLane
                ? '• Use the designated left lane for Autos and Commercial Cabs to bypass the private vehicle queue.'
                : '• Single combined entry lane. Follow traffic marshal instructions at the forecourt.'}
              {station.pressureBar && ` • High pressure ${station.pressureBar} bar currently active for rapid tank filling.`}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-2.5">
          <button
            onClick={onClose}
            className="w-full py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors text-center border border-slate-200"
          >
            Back to App
          </button>

          <a
            id="btn-open-google-maps"
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 active:scale-98"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
