import React from 'react';
import { NotificationItem, CNGStation } from '../types';
import { X, Bell, CheckCheck, Trash2, ShieldCheck, Zap, Fuel } from 'lucide-react';
import { formatTimeAgo } from '../data/mockStations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  stations: CNGStation[];
  onMarkRead: (notifId: string) => void;
  onMarkAllRead: () => void;
  onSelectStation: (station: CNGStation) => void;
}

export const NotificationDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  stations,
  onMarkRead,
  onMarkAllRead,
  onSelectStation
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="notifications-drawer"
        className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="p-2 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Bell className="w-10 h-10 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-900">No notifications yet</h4>
              <p className="text-xs text-slate-500">
                Set alerts on stations to receive availability and short queue notifications.
              </p>
            </div>
          ) : (
            notifications.map(notif => {
              const matchedStation = stations.find(s => s.id === notif.stationId);

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkRead(notif.id);
                    if (matchedStation) {
                      onSelectStation(matchedStation);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-white border-blue-300 text-slate-900 shadow-xs ring-1 ring-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.read ? 'bg-slate-300' : 'bg-blue-600 animate-pulse'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      {matchedStation && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                          <span>View Station Status →</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
