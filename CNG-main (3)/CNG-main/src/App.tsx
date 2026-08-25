import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CNGStation, UserReport, NotificationPreference, NotificationItem, UserProfile } from './types';
import { stationService } from './services/stationService';
import { INITIAL_USER_LOCATION } from './data/mockStations';
import { Navbar } from './components/Navbar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { MapView } from './components/MapView';
import { NearbyListView } from './components/NearbyListView';
import { UpdatesFeedView } from './components/UpdatesFeedView';
import { ProfileView } from './components/ProfileView';
import { StationDetailModal } from './components/StationDetailModal';
import { StatusUpdateModal } from './components/StatusUpdateModal';
import { NotificationModal } from './components/NotificationModal';
import { ArchitectureInfoModal } from './components/ArchitectureInfoModal';
import { DirectionsModal } from './components/DirectionsModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SmartRecommendationCard } from './components/SmartRecommendationCard';
import { ShieldAlert, Sparkles, Navigation, Search, MapPin, X, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Device view mode (Mobile Phone Frame simulator vs Full Width)
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // User location state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; areaName: string }>(
    INITIAL_USER_LOCATION
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Stations & Domain State
  const [stations, setStations] = useState<CNGStation[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference[]>([]);
  const [profile, setProfile] = useState<UserProfile>(stationService.getProfile());

  // Search & Map Filter State
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [mapFilterAvailability, setMapFilterAvailability] = useState<'all' | 'available' | 'short_queue'>('all');

  // Modals & Sheets State
  const [selectedStation, setSelectedStation] = useState<CNGStation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const [reportModalStation, setReportModalStation] = useState<CNGStation | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const [notifModalStation, setNotifModalStation] = useState<CNGStation | null>(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);

  const [directionsStation, setDirectionsStation] = useState<CNGStation | null>(null);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState<boolean>(false);

  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'alert' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Reload all state from service
  const reloadData = useCallback(() => {
    const freshStations = stationService.getStations(userLocation.latitude, userLocation.longitude);
    setStations(freshStations);
    setReports(stationService.getReports());
    setNotifications(stationService.getNotificationItems());
    setNotificationPrefs(stationService.getNotificationPreferences());
    setProfile(stationService.getProfile());
  }, [userLocation]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Smart Recommendation calculation
  const recommendation = useMemo(() => {
    return stationService.getSmartRecommendation(userLocation.latitude, userLocation.longitude);
  }, [stations, userLocation]);

  // Use My Location handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser. Using South Delhi Hub.', 'alert');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          latitude,
          longitude,
          areaName: 'Current Live GPS Location'
        });
        setIsLocating(false);
        showToast('Updated location from device GPS!', 'success');
      },
      error => {
        setIsLocating(false);
        // Fallback simulated jitter
        setUserLocation(prev => ({
          latitude: INITIAL_USER_LOCATION.latitude + (Math.random() - 0.5) * 0.008,
          longitude: INITIAL_USER_LOCATION.longitude + (Math.random() - 0.5) * 0.008,
          areaName: 'South Delhi / Nehru Place Hub'
        }));
        showToast('GPS permission denied or unavailable. Centered on South Delhi.', 'info');
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  // Open Details Modal
  const handleSelectStation = (station: CNGStation) => {
    setSelectedStation(station);
    setIsDetailModalOpen(true);
  };

  // Open Directions
  const handleNavigate = (station: CNGStation) => {
    setDirectionsStation(station);
    setIsDirectionsModalOpen(true);
  };

  // Open Report Modal
  const handleOpenReportModal = (station?: CNGStation) => {
    const target = station || selectedStation || stations[0];
    if (target) {
      setReportModalStation(target);
      setIsReportModalOpen(true);
    }
  };

  // Submit Report
  const handleSubmitReport = (reportData: {
    stationId: string;
    stationName: string;
    availability: any;
    queueLength: any;
    estimatedQueueCount?: number;
    pressureBar?: number;
    activeDispensers?: number;
    notes?: string;
    tags?: string[];
  }) => {
    try {
      const res = stationService.submitReport(reportData);
      reloadData();
      if (selectedStation && selectedStation.id === reportData.stationId) {
        setSelectedStation(res.updatedStation);
      }
      showToast(`Report submitted! +${res.karmaGained} Community Karma points earned.`, 'success');
    } catch (err) {
      showToast('Could not submit report. Please try again.', 'alert');
    }
  };

  // Upvote report
  const handleUpvoteReport = (reportId: string) => {
    const updated = stationService.upvoteReport(reportId);
    if (updated) {
      setReports(stationService.getReports());
      if (updated.hasUserUpvoted) {
        showToast('Thank you for confirming this driver report!', 'success');
      }
    }
  };

  // Open Notifications modal
  const handleOpenNotificationModal = (station: CNGStation) => {
    setNotifModalStation(station);
    setIsNotifModalOpen(true);
  };

  // Save Notification Preference
  const handleSaveNotificationPreference = (
    stationId: string,
    stationName: string,
    alertWhenAvailable: boolean,
    alertWhenShortQueue: boolean
  ) => {
    stationService.setNotificationPreference(stationId, stationName, alertWhenAvailable, alertWhenShortQueue);
    setNotificationPrefs(stationService.getNotificationPreferences());
    showToast(`Alerts updated for ${stationName}`, 'success');
  };

  // Favorites
  const handleToggleFavorite = (stationId: string) => {
    const isFav = stationService.toggleFavorite(stationId);
    setProfile({ ...stationService.getProfile() });
    showToast(isFav ? 'Added to your favorites' : 'Removed from favorites', 'info');
  };

  const isFavorite = (stationId: string) => {
    return stationService.isFavorite(stationId);
  };

  // Simulation Trigger
  const handleSimulateUpdate = () => {
    const res = stationService.simulateRandomUpdate();
    reloadData();
    showToast(`⚡ Simulation: Live queue update broadcast for ${res.updatedStation.name}!`, 'info');
  };

  // Reset Data
  const handleResetData = () => {
    stationService.resetToDefault();
    reloadData();
    showToast('Reset station data to default mock values.', 'info');
  };

  // Filtered stations for Home Map Search
  const mapFilteredStations = useMemo(() => {
    let result = [...stations];
    if (mapSearchQuery.trim()) {
      const q = mapSearchQuery.toLowerCase().trim();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q)
      );
    }
    return result;
  }, [stations, mapSearchQuery]);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-start ${
      isMobileFrame ? 'py-4 sm:py-8 px-2 bg-slate-950/90' : ''
    }`}>
      {/* Outer Shell for Mobile Frame on Desktop */}
      <div
        className={`w-full flex flex-col transition-all duration-300 relative ${
          isMobileFrame
            ? 'max-w-[430px] h-[92vh] max-h-[880px] rounded-[42px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-slate-900 ring-1 ring-slate-700'
            : 'max-w-4xl min-h-screen bg-slate-900 shadow-2xl border-x border-slate-800'
        }`}
      >
        {/* Prototype Crowdsource Notice Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border-b border-teal-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-teal-300/90">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
            <span className="truncate">
              <strong>Crowdsourced Prototype:</strong> CNG availability is reported by community drivers.
            </span>
          </div>
          <button
            onClick={() => setIsArchitectureModalOpen(true)}
            className="text-[10px] font-bold text-teal-300 underline hover:text-white flex-shrink-0 ml-2"
          >
            How it works
          </button>
        </div>

        {/* Top Navbar */}
        <Navbar
          userLocationName={userLocation.areaName}
          onUseMyLocation={handleUseMyLocation}
          isLocating={isLocating}
          unreadNotifsCount={unreadNotifsCount}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
          onSimulateUpdate={handleSimulateUpdate}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-3 right-3 z-50 animate-in slide-in-from-top-2 duration-200">
            <div
              className={`p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md border ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/60 shadow-emerald-950/50'
                  : toastMessage.type === 'alert'
                  ? 'bg-rose-950/95 text-rose-200 border-rose-500/60 shadow-rose-950/50'
                  : 'bg-teal-950/95 text-teal-200 border-teal-500/60 shadow-teal-950/50'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : toastMessage.type === 'alert' ? (
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <Zap className="w-4 h-4 text-teal-400 flex-shrink-0" />
              )}
              <span className="flex-1 leading-snug">{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Main View Router */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-900">
          {/* TAB 1: HOME (Map View + Search + Quick Recommendation Sheet) */}
          {activeTab === 'home' && (
            <div className="relative w-full h-full flex flex-col">
              {/* Map Search Bar overlay */}
              <div className="absolute top-3 left-3 right-3 z-20">
                <div className="relative shadow-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    id="input-map-search"
                    type="text"
                    value={mapSearchQuery}
                    onChange={e => setMapSearchQuery(e.target.value)}
                    placeholder="Search CNG station or area..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xl"
                  />
                  {mapSearchQuery && (
                    <button
                      onClick={() => setMapSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search query match dropdown preview */}
                {mapSearchQuery.trim() && (
                  <div className="mt-1.5 max-h-48 overflow-y-auto rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl p-1.5 space-y-1">
                    {mapFilteredStations.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">No stations match "{mapSearchQuery}"</div>
                    ) : (
                      mapFilteredStations.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedStation(s);
                            setMapSearchQuery('');
                          }}
                          className="p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer text-xs"
                        >
                          <div className="truncate">
                            <span className="font-semibold text-white">{s.name}</span>
                            <span className="text-[11px] text-slate-400 block truncate">{s.address}</span>
                          </div>
                          <span className="text-emerald-400 font-bold flex-shrink-0">{s.distanceKm} km</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Leaflet Map */}
              <div className="flex-1 w-full h-full relative">
                <MapView
                  stations={mapFilteredStations}
                  userLocation={userLocation}
                  selectedStation={selectedStation}
                  onSelectStation={handleSelectStation}
                  onUseMyLocation={handleUseMyLocation}
                  isLocating={isLocating}
                  filterAvailability={mapFilterAvailability}
                  onFilterChange={setMapFilterAvailability}
                />
              </div>

              {/* Bottom Floating Quick Card: Smart Recommendation or Selected Station */}
              <div className="p-3 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent pointer-events-auto border-t border-slate-800/60 z-20">
                {selectedStation ? (
                  <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/50 shadow-2xl space-y-2.5 animate-in slide-in-from-bottom duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-teal-300 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-500/30">
                            {selectedStation.brand}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {selectedStation.distanceKm} km away
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{selectedStation.name}</h4>
                      </div>

                      <button
                        onClick={() => setSelectedStation(null)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      <span className="text-emerald-300 font-bold">
                        ~{selectedStation.estimatedWaitMinutes} min wait ({selectedStation.queueLength} queue)
                      </span>
                      <span className="text-slate-400">
                        {selectedStation.activeDispensers}/{selectedStation.dispensersCount} pumps
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setIsDetailModalOpen(true)}
                        className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center"
                      >
                        View Full Details
                      </button>
                      <button
                        onClick={() => handleNavigate(selectedStation)}
                        className="py-2 px-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Navigate
                      </button>
                    </div>
                  </div>
                ) : (
                  <SmartRecommendationCard
                    recommendation={recommendation}
                    onSelectStation={handleSelectStation}
                    onGetDirections={handleNavigate}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NEARBY STATIONS LIST */}
          {activeTab === 'nearby' && (
            <NearbyListView
              stations={stations}
              recommendation={recommendation}
              onSelectStation={handleSelectStation}
              onNavigate={handleNavigate}
              onQuickReport={handleOpenReportModal}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* TAB 3: UPDATES & DRIVER WIRE */}
          {activeTab === 'updates' && (
            <UpdatesFeedView
              reports={reports}
              notifications={notifications}
              stations={stations}
              onUpvoteReport={handleUpvoteReport}
              onOpenReportModal={handleOpenReportModal}
              onMarkNotificationRead={id => {
                stationService.markNotificationAsRead(id);
                setNotifications(stationService.getNotificationItems());
              }}
              onMarkAllNotificationsRead={() => {
                stationService.markAllNotificationsAsRead();
                setNotifications(stationService.getNotificationItems());
                showToast('All notifications marked as read', 'info');
              }}
              onSelectStation={handleSelectStation}
            />
          )}

          {/* TAB 4: PROFILE & FAVORITES */}
          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              stations={stations}
              notificationPrefs={notificationPrefs}
              onUpdateProfile={updates => {
                const updated = stationService.updateProfile(updates);
                setProfile(updated);
                showToast('Profile updated successfully', 'success');
              }}
              onSelectStation={handleSelectStation}
              onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
              onSimulateUpdate={handleSimulateUpdate}
              onResetData={handleResetData}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          updatesBadgeCount={unreadNotifsCount}
        />

        {/* MODALS */}
        {/* 1. Station Details Modal */}
        <StationDetailModal
          station={selectedStation}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onNavigate={handleNavigate}
          onOpenReportModal={handleOpenReportModal}
          onOpenNotificationModal={handleOpenNotificationModal}
          notificationPref={selectedStation ? stationService.getNotificationPreferenceForStation(selectedStation.id) : undefined}
          reports={selectedStation ? stationService.getReports(selectedStation.id) : []}
          onUpvoteReport={handleUpvoteReport}
          isFavorite={selectedStation ? isFavorite(selectedStation.id) : false}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* 2. Status Update Modal */}
        <StatusUpdateModal
          station={reportModalStation}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleSubmitReport}
        />

        {/* 3. Notification Preferences Modal */}
        <NotificationModal
          station={notifModalStation}
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          existingPref={notifModalStation ? stationService.getNotificationPreferenceForStation(notifModalStation.id) : undefined}
          onSave={handleSaveNotificationPreference}
        />

        {/* 4. Directions & Routing Modal */}
        <DirectionsModal
          station={directionsStation}
          isOpen={isDirectionsModalOpen}
          onClose={() => setIsDirectionsModalOpen(false)}
          userLocation={userLocation}
        />

        {/* 5. System Architecture & Technical Specs Modal */}
        <ArchitectureInfoModal
          isOpen={isArchitectureModalOpen}
          onClose={() => setIsArchitectureModalOpen(false)}
        />

        {/* 6. In-App Notifications Drawer */}
        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          notifications={notifications}
          stations={stations}
          onMarkRead={id => {
            stationService.markNotificationAsRead(id);
            setNotifications(stationService.getNotificationItems());
          }}
          onMarkAllRead={() => {
            stationService.markAllNotificationsAsRead();
            setNotifications(stationService.getNotificationItems());
            showToast('All notifications marked as read', 'info');
          }}
          onSelectStation={handleSelectStation}
        />
      </div>
    </div>
  );
}
