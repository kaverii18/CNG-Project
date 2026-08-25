import React from 'react';
import { Fuel, MapPin, Bell, Smartphone, Monitor, Zap, Info, ShieldAlert } from 'lucide-react';

interface Props {
  userLocationName: string;
  onUseMyLocation: () => void;
  isLocating: boolean;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenArchitectureModal: () => void;
  onSimulateUpdate: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const Navbar: React.FC<Props> = ({
  userLocationName,
  onUseMyLocation,
  isLocating,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenArchitectureModal,
  onSimulateUpdate,
  isMobileFrame,
  onToggleMobileFrame
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-4 py-2.5">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white shadow-sm flex items-center justify-center flex-shrink-0 font-bold">
            <Fuel className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none font-display">
                CNG Finder
              </h1>
              <span className="px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-md">
                LIVE
              </span>
            </div>
            <button
              onClick={onUseMyLocation}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition-colors mt-0.5 text-left font-medium"
              title="Click to refresh GPS location"
            >
              <MapPin className={`w-3 h-3 text-blue-600 flex-shrink-0 ${isLocating ? 'animate-bounce' : ''}`} />
              <span className="truncate max-w-[130px] sm:max-w-[190px]">{userLocationName}</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Simulation trigger */}
          <button
            id="nav-btn-simulate"
            onClick={onSimulateUpdate}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Simulate a live queue/availability change"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Simulate</span>
          </button>

          {/* Architecture info button */}
          <button
            id="nav-btn-arch-info"
            onClick={onOpenArchitectureModal}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="View System Architecture & Specs"
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Specs</span>
          </button>

          {/* Desktop Frame Toggle (hidden on small mobile screens) */}
          <button
            id="nav-btn-frame-toggle"
            onClick={onToggleMobileFrame}
            className="hidden md:flex p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title={isMobileFrame ? 'Expand to Full Width' : 'Switch to Mobile Phone Frame'}
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <button
            id="nav-btn-notifs"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
