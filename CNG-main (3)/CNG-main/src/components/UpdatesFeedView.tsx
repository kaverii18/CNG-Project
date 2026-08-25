import React, { useState } from 'react';
import { UserReport, NotificationItem, CNGStation } from '../types';
import { AvailabilityBadge } from './StatusBadges';
import {
  MessageSquarePlus,
  ThumbsUp,
  Clock,
  Car,
  Bell,
  CheckCheck,
  ShieldCheck,
  Fuel,
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';
import { formatTimeAgo } from '../data/mockStations';

interface Props {
  reports: UserReport[];
  notifications: NotificationItem[];
  stations: CNGStation[];
  onUpvoteReport: (reportId: string) => void;
  onOpenReportModal: (station?: CNGStation) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onMarkAllNotificationsRead: () => void;
  onSelectStation: (station: CNGStation) => void;
}

export const UpdatesFeedView: React.FC<Props> = ({
  reports,
  notifications,
  stations,
  onUpvoteReport,
  onOpenReportModal,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectStation
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'alerts'>('feed');
  const [filterVehicle, setFilterVehicle] = useState<'all' | 'auto' | 'cab' | 'private_car'>('all');

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const filteredReports = reports.filter(r => {
    if (filterVehicle === 'all') return true;
    return r.vehicleType === filterVehicle;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Live Driver Wire</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">Crowdsourced CNG Updates</h3>
          <p className="text-xs text-slate-400">Real-time driver reports & automated telemetry</p>
        </div>

        <button
          id="btn-feed-post-report"
          onClick={() => onOpenReportModal()}
          className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 whitespace-nowrap"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Share Update
        </button>
      </div>

      {/* Segment Tabs: Live Feed vs Alerts */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          id="tab-updates-feed"
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'feed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-blue-600" />
          Live Community Feed ({reports.length})
        </button>

        <button
          id="tab-updates-alerts"
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'alerts'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          My Station Alerts
          {unreadNotifsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-black rounded-full">
              {unreadNotifsCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'feed' ? (
        <>
          {/* Vehicle filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 text-xs font-medium">Filter by driver:</span>
            {(['all', 'auto', 'cab', 'private_car'] as const).map(v => (
              <button
                key={v}
                onClick={() => setFilterVehicle(v)}
                className={`px-3 py-1 rounded-xl font-semibold capitalize transition-all border ${
                  filterVehicle === v
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {v === 'all' ? 'All Drivers' : v.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Reports Timeline */}
          <div className="space-y-3">
            {filteredReports.map(rep => {
              const matchedStation = stations.find(s => s.id === rep.stationId);

              return (
                <div
                  key={rep.id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-4 space-y-2.5 transition-all hover:border-slate-300 hover:shadow-xs"
                >
                  {/* Station Link & Author */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        onClick={() => matchedStation && onSelectStation(matchedStation)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1"
                      >
                        {rep.stationName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-800">{rep.userNickname}</span>
                        <span>•</span>
                        <span className="capitalize bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px] text-slate-700">
                          {rep.vehicleType}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(rep.timestamp)}</span>
                      </div>
                    </div>

                    <AvailabilityBadge availability={rep.availability} size="sm" />
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                      Queue: <strong className="capitalize text-slate-900">{rep.queueLength}</strong>
                      {typeof rep.estimatedQueueCount === 'number' && rep.estimatedQueueCount > 0 && ` (~${rep.estimatedQueueCount} cars)`}
                    </span>

                    {rep.pressureBar && (
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg font-mono">
                        {rep.pressureBar} Bar
                      </span>
                    )}
                  </div>

                  {/* Notes text */}
                  {rep.notes && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                      "{rep.notes}"
                    </p>
                  )}

                  {/* Tags & Upvote */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {rep.tags?.map((t, idx) => (
                        <span key={idx} className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onUpvoteReport(rep.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                        rep.hasUserUpvoted
                          ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${rep.hasUserUpvoted ? 'fill-blue-600' : ''}`} />
                      <span>{rep.upvotes} Helpful</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Alerts & In-App Notifications Tab */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Recent Station Alerts</span>
            {unreadNotifsCount > 0 && (
              <button
                onClick={onMarkAllNotificationsRead}
                className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2 shadow-xs">
              <Bell className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No active notifications yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Set alerts on your favorite stations to get notified when CNG becomes available or queues drop.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map(notif => {
                const matchedStation = stations.find(s => s.id === notif.stationId);

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkNotificationRead(notif.id);
                      if (matchedStation) onSelectStation(matchedStation);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 text-slate-500'
                        : 'bg-white border-blue-300 text-slate-900 shadow-xs ring-1 ring-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? 'bg-slate-300' : 'bg-blue-600 animate-pulse'}`} />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            {formatTimeAgo(notif.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
