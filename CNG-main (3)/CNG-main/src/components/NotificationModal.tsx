import React, { useState } from 'react';
import { CNGStation, NotificationPreference } from '../types';
import { X, Bell, BellRing, Check, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  station: CNGStation | null;
  isOpen: boolean;
  onClose: () => void;
  existingPref?: NotificationPreference;
  onSave: (stationId: string, stationName: string, alertWhenAvailable: boolean, alertWhenShortQueue: boolean) => void;
}

export const NotificationModal: React.FC<Props> = ({
  station,
  isOpen,
  onClose,
  existingPref,
  onSave
}) => {
  if (!isOpen || !station) return null;

  const [alertWhenAvailable, setAlertWhenAvailable] = useState<boolean>(
    existingPref?.alertWhenAvailable ?? true
  );
  const [alertWhenShortQueue, setAlertWhenShortQueue] = useState<boolean>(
    existingPref?.alertWhenShortQueue ?? true
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    onSave(station.id, station.name, alertWhenAvailable, alertWhenShortQueue);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="notification-preference-modal"
        className="w-full max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">CNG Alerts & Notifications</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{station.name}</p>
            </div>
          </div>

          <button
            id="btn-close-notif-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Choose what alerts you want to receive for this station. You will receive real-time push and in-app alerts as soon as drivers or telemetry report status updates.
          </p>

          <div className="space-y-3">
            {/* Toggle 1: Notify when CNG becomes available */}
            <div
              onClick={() => setAlertWhenAvailable(!alertWhenAvailable)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                alertWhenAvailable
                  ? 'bg-blue-50/50 border-blue-300 text-slate-900 ring-1 ring-blue-100'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Notify me when CNG becomes available</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-4">
                  Trigger alert when out-of-stock station or closed station resumes gas dispensing.
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 mt-0.5 ${
                  alertWhenAvailable
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {alertWhenAvailable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Toggle 2: Notify when Queue is Short */}
            <div
              onClick={() => setAlertWhenShortQueue(!alertWhenShortQueue)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                alertWhenShortQueue
                  ? 'bg-blue-50/50 border-blue-300 text-slate-900 ring-1 ring-blue-100'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Notify when Queue is Short (&lt; 10 min wait)</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  Get pinged immediately when line clears so you can fill up without waiting.
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 mt-0.5 ${
                  alertWhenShortQueue
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {alertWhenShortQueue && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Alerts are powered by smart crowd reports and automated station telemetry.</span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-in zoom-in-95">
              ✓ Alert preferences saved!
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="btn-save-notif-prefs"
              onClick={handleSave}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 active:scale-98"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
