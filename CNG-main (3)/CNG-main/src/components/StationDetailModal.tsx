import React from 'react';
import { CNGStation, UserReport, NotificationPreference } from '../types';
import { AvailabilityBadge, QueueBadge, PressureBadge } from './StatusBadges';
import {
  X,
  Navigation,
  MessageSquarePlus,
  Bell,
  BellRing,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Fuel,
  ThumbsUp,
  CreditCard,
  Car,
  AlertCircle,
  Share2,
  Heart
} from 'lucide-react';
import { formatTimeAgo } from '../data/mockStations';

interface Props {
  station: CNGStation | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (station: CNGStation) => void;
  onOpenReportModal: (station: CNGStation) => void;
  onOpenNotificationModal: (station: CNGStation) => void;
  notificationPref?: NotificationPreference;
  reports: UserReport[];
  onUpvoteReport: (reportId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (stationId: string) => void;
}

export const StationDetailModal: React.FC<Props> = ({
  station,
  isOpen,
  onClose,
  onNavigate,
  onOpenReportModal,
  onOpenNotificationModal,
  notificationPref,
  reports,
  onUpvoteReport,
  isFavorite,
  onToggleFavorite
}) => {
  if (!isOpen || !station) return null;

  const hasAlerts = notificationPref && (notificationPref.alertWhenAvailable || notificationPref.alertWhenShortQueue);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="station-detail-sheet"
        className="w-full max-w-lg max-h-[90vh] bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Top Handle / Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-slate-200 flex items-start justify-between bg-white">
          <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />

          <div className="flex-1 pr-2 pt-2 sm:pt-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {station.brand}
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {station.operatingHours}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {station.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              id="btn-modal-fav"
              onClick={() => onToggleFavorite(station.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Save Favorite'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              id="btn-close-station-detail"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Main Status & Queue Card */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <AvailabilityBadge availability={station.availability} size="lg" />
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Distance</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1 justify-end">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  {station.distanceKm} km (~{station.drivingEtaMinutes} min drive)
                </span>
              </div>
            </div>

            {/* Queue & Wait Time Breakdown */}
            {station.availability !== 'not_available' ? (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 uppercase font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Estimated Wait
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">
                    ~{station.estimatedWaitMinutes} mins
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Queue: <strong className="capitalize text-slate-800">{station.queueLength}</strong> (~{station.queueCount || 4} vehicles)
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 uppercase font-medium flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-blue-600" />
                    Pressure & Pumps
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">
                    {station.pressureBar ? `${station.pressureBar} bar` : 'Standard'}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {station.activeDispensers} of {station.dispensersCount} dispensers active
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <p>
                  CNG is currently out of stock or under compressor maintenance according to recent driver reports. Consider alternative nearby stations.
                </p>
              </div>
            )}

            {/* Last update metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated {formatTimeAgo(station.lastUpdated)}
                {station.lastUpdatedBy && <span className="text-slate-700 font-medium">by {station.lastUpdatedBy}</span>}
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {station.verifiedReportsCount} driver checks
              </span>
            </div>
          </div>

          {/* Quick Features List */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <Car className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-700">
                {station.hasDedicatedAutoLane ? 'Dedicated Auto / Cab Lane' : 'Mixed Vehicle Queue'}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-700">
                {station.acceptsDigitalPayment ? 'UPI & Cards Accepted' : 'Cash Preferred'}
              </span>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed">{station.address}</p>
            </div>
            {station.phone && (
              <div className="flex items-center gap-2.5 pt-1 border-t border-slate-200 text-xs">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${station.phone}`} className="text-blue-600 hover:underline">
                  {station.phone}
                </a>
              </div>
            )}
          </div>

          {/* Notification Alert Status / Button */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${hasAlerts ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                {hasAlerts ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  {hasAlerts ? 'Active CNG Alerts' : 'Get Availability Alerts'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {hasAlerts ? 'You will be notified on status changes' : 'Notify me when CNG is available / queue is short'}
                </p>
              </div>
            </div>

            <button
              id="btn-station-notification"
              onClick={() => onOpenNotificationModal(station)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap ${
                hasAlerts
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {hasAlerts ? 'Edit Alerts' : 'Notify Me'}
            </button>
          </div>

          {/* Community Updates & Recent Reports */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Driver Reports ({reports.length})
              </h4>
              <button
                id="btn-post-update-sub"
                onClick={() => onOpenReportModal(station)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Post Update
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">No driver comments yet today. Be the first to share current queue status!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.slice(0, 4).map(rep => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{rep.userNickname}</span>
                        <span className="text-[10px] text-slate-600 capitalize bg-slate-100 px-1.5 py-0.5 rounded">
                          {rep.vehicleType}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatTimeAgo(rep.timestamp)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        rep.availability === 'available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        rep.availability === 'uncertain' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {rep.availability === 'available' ? 'Available' : rep.availability === 'uncertain' ? 'Uncertain' : 'Not Available'}
                      </span>
                      <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        Queue: <strong className="capitalize">{rep.queueLength}</strong>
                      </span>
                      {rep.pressureBar && (
                        <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          {rep.pressureBar} bar
                        </span>
                      )}
                    </div>

                    {rep.notes && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        "{rep.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        {rep.tags?.map((t, idx) => (
                          <span key={idx} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => onUpvoteReport(rep.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                          rep.hasUserUpvoted
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ThumbsUp className={`w-3 h-3 ${rep.hasUserUpvoted ? 'fill-blue-600' : ''}`} />
                        <span>{rep.upvotes} Helpful</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-2.5">
          <button
            id="btn-modal-update-status"
            onClick={() => onOpenReportModal(station)}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-blue-600" />
            Update Status
          </button>

          <button
            id="btn-modal-get-directions"
            onClick={() => onNavigate(station)}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm shadow-blue-500/20"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};
