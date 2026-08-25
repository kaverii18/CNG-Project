import React, { useState } from 'react';
import { UserProfile, CNGStation, NotificationPreference } from '../types';
import { AvailabilityBadge } from './StatusBadges';
import {
  User,
  Car,
  Heart,
  Bell,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Zap,
  Info,
  Edit2,
  Check
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  stations: CNGStation[];
  notificationPrefs: NotificationPreference[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onSelectStation: (station: CNGStation) => void;
  onOpenArchitectureModal: () => void;
  onSimulateUpdate: () => void;
  onResetData: () => void;
}

export const ProfileView: React.FC<Props> = ({
  profile,
  stations,
  notificationPrefs,
  onUpdateProfile,
  onSelectStation,
  onOpenArchitectureModal,
  onSimulateUpdate,
  onResetData
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>(profile.nickname);
  const [vehicleType, setVehicleType] = useState<UserProfile['vehicleType']>(profile.vehicleType);
  const [tankCapacity, setTankCapacity] = useState<number>(profile.fuelTankCapacityKg);

  const favoriteStations = stations.filter(s => profile.favoriteStationIds.includes(s.id));

  const handleSaveProfile = () => {
    onUpdateProfile({
      nickname,
      vehicleType,
      fuelTankCapacityKg: tankCapacity
    });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl mx-auto w-full">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <User className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{profile.nickname}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {profile.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 capitalize mt-0.5 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                {profile.vehicleType.replace('_', ' ')} • {profile.fuelTankCapacityKg} kg Tank
              </p>
            </div>
          </div>

          <button
            id="btn-edit-profile-toggle"
            onClick={() => {
              if (isEditing) handleSaveProfile();
              else setIsEditing(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              isEditing
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Driver Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Primary Vehicle
                </label>
                <select
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="auto">Auto Rickshaw</option>
                  <option value="cab">Commercial Cab / Taxi</option>
                  <option value="private_car">Private Car</option>
                  <option value="commercial">Commercial Van / LCV</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Tank Capacity (kg)
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={tankCapacity}
                  onChange={e => setTankCapacity(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500">Karma Points</span>
            <p className="text-base font-extrabold text-blue-700 mt-0.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {profile.communityKarma}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500">Reports Sent</span>
            <p className="text-base font-extrabold text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {profile.reportsSubmitted}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500">Saved Stations</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              {profile.favoriteStationIds.length}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Favorites Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          My Favorite CNG Stations ({favoriteStations.length})
        </h4>

        {favoriteStations.length === 0 ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 shadow-2xs">
            No favorite stations saved yet. Tap the heart icon on any station to pin it here.
          </div>
        ) : (
          <div className="space-y-2">
            {favoriteStations.map(station => (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{station.name}</span>
                    <span className="text-[10px] text-slate-500">{station.distanceKm} km</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <AvailabilityBadge availability={station.availability} size="sm" />
                    {station.availability !== 'not_available' && (
                      <span className="text-xs text-slate-600">
                        ~{station.estimatedWaitMinutes}m wait ({station.queueLength} queue)
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscribed Alerts Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          Active Station Alerts ({notificationPrefs.length})
        </h4>

        {notificationPrefs.length === 0 ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 shadow-2xs">
            No active alerts configured. Open any station details to toggle availability notifications.
          </div>
        ) : (
          <div className="space-y-2">
            {notificationPrefs.map(pref => (
              <div
                key={pref.stationId}
                className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <span className="font-semibold text-slate-900">{pref.stationName}</span>
                  <div className="flex items-center gap-2 text-[11px] text-blue-600 mt-0.5">
                    {pref.alertWhenAvailable && <span>• When Available</span>}
                    {pref.alertWhenShortQueue && <span>• When Queue &lt; 10m</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical Architecture & Specs Trigger */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Architecture & Integration Blueprint</h4>
            <p className="text-[11px] text-slate-500">View Firestore schemas, data flow & telemetry design</p>
          </div>
        </div>

        <button
          id="btn-view-architecture-modal"
          onClick={onOpenArchitectureModal}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 whitespace-nowrap"
        >
          View Specs
        </button>
      </div>

      {/* Prototype Testing Sandbox Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Prototype Simulator & Reset
        </h4>
        <p className="text-[11px] text-slate-500">
          Test real-time notification alerts, live queue updates, and reset mock data storage.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-sim-live-update"
            onClick={onSimulateUpdate}
            className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Simulate Live Update
          </button>

          <button
            id="btn-reset-prototype-data"
            onClick={onResetData}
            className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
