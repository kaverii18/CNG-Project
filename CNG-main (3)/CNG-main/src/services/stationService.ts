import { CNGStation, UserReport, NotificationPreference, NotificationItem, UserProfile, FilterOptions, SortOption } from '../types';
import { MOCK_STATIONS, INITIAL_USER_REPORTS, INITIAL_USER_LOCATION, calculateDistanceKm } from '../data/mockStations';

const STORAGE_KEYS = {
  STATIONS: 'cng_finder_stations_v1',
  REPORTS: 'cng_finder_reports_v1',
  NOTIFICATIONS: 'cng_finder_notifications_v1',
  NOTIF_ITEMS: 'cng_finder_notif_items_v1',
  PROFILE: 'cng_finder_profile_v1',
};

export class StationService {
  private stations: CNGStation[] = [];
  private reports: UserReport[] = [];
  private notificationPreferences: NotificationPreference[] = [];
  private notificationItems: NotificationItem[] = [];
  private profile: UserProfile = {
    nickname: 'EcoDriver_99',
    vehicleType: 'cab',
    fuelTankCapacityKg: 10,
    favoriteStationIds: ['cng-del-01', 'cng-del-03'],
    reportsSubmitted: 4,
    communityKarma: 65,
    badge: 'Gold Scout'
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const storedStations = localStorage.getItem(STORAGE_KEYS.STATIONS);
      this.stations = storedStations ? JSON.parse(storedStations) : [...MOCK_STATIONS];

      const storedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      this.reports = storedReports ? JSON.parse(storedReports) : [...INITIAL_USER_REPORTS];

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notificationPreferences = storedNotifs ? JSON.parse(storedNotifs) : [];

      const storedNotifItems = localStorage.getItem(STORAGE_KEYS.NOTIF_ITEMS);
      this.notificationItems = storedNotifItems ? JSON.parse(storedNotifItems) : [
        {
          id: 'notif-init-1',
          stationId: 'cng-del-01',
          stationName: 'IGL CNG Filling Station - Nehru Place',
          title: '⚡ Fast Queue Alert',
          message: 'Queue dropped to 4 vehicles (approx. 8 min wait) at Nehru Place.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          type: 'queue_drop',
          read: false
        },
        {
          id: 'notif-init-2',
          stationId: 'cng-del-03',
          stationName: 'IOCL Mother Station - Okhla Phase 1',
          title: '🟢 High Pressure CNG Live',
          message: 'All 8 dispensers running at 220 bar with under 6 min wait.',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          type: 'available',
          read: true
        }
      ];

      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedProfile) {
        this.profile = JSON.parse(storedProfile);
      }
    } catch {
      this.stations = [...MOCK_STATIONS];
      this.reports = [...INITIAL_USER_REPORTS];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(this.stations));
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notificationPreferences));
      localStorage.setItem(STORAGE_KEYS.NOTIF_ITEMS, JSON.stringify(this.notificationItems));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  // Get all stations with distance calculated from given user coordinates
  public getStations(userLat: number = INITIAL_USER_LOCATION.latitude, userLon: number = INITIAL_USER_LOCATION.longitude): CNGStation[] {
    return this.stations.map(station => {
      const dist = calculateDistanceKm(userLat, userLon, station.latitude, station.longitude);
      // Rough driving ETA: average city speed 25 km/h + 2 mins traffic buffer
      const drivingMins = Math.max(2, Math.round((dist / 25) * 60) + 1);
      return {
        ...station,
        distanceKm: dist,
        drivingEtaMinutes: drivingMins
      };
    });
  }

  public getStationById(id: string, userLat?: number, userLon?: number): CNGStation | undefined {
    const list = this.getStations(userLat, userLon);
    return list.find(s => s.id === id);
  }

  // Filter and sort stations
  public filterStations(
    stations: CNGStation[],
    filters: FilterOptions,
    sortBy: SortOption = 'recommended'
  ): CNGStation[] {
    let result = [...stations];

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q)
      );
    }

    // Availability filter
    if (filters.availability !== 'all') {
      result = result.filter(s => s.availability === filters.availability);
    }

    // Open only
    if (filters.openOnly) {
      result = result.filter(s => s.isOpen);
    }

    // High pressure only (> 200 bar)
    if (filters.highPressureOnly) {
      result = result.filter(s => (s.pressureBar ?? 0) >= 200);
    }

    // Digital payment
    if (filters.digitalPaymentOnly) {
      result = result.filter(s => s.acceptsDigitalPayment);
    }

    // Max wait minutes filter
    if (filters.maxWaitMinutes) {
      result = result.filter(s => s.estimatedWaitMinutes <= filters.maxWaitMinutes!);
    }

    // Sorting
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
      // 'recommended' sort
      const scoreA = this.calculateRecommendationScore(a);
      const scoreB = this.calculateRecommendationScore(b);
      return scoreB - scoreA;
    });

    return result;
  }

  // Recommendation algorithm:
  // Combines availability, distance penalty, queue wait penalty, pressure bonus
  private calculateRecommendationScore(station: CNGStation): number {
    let score = 0;
    if (station.availability === 'available') score += 100;
    else if (station.availability === 'uncertain') score += 40;
    else score -= 100; // not available

    const dist = station.distanceKm ?? 5;
    score -= dist * 7; // -7 points per km

    score -= station.estimatedWaitMinutes * 1.8; // -1.8 points per minute of wait

    if ((station.pressureBar ?? 0) >= 210) score += 12; // good pressure bonus
    if (station.hasDedicatedAutoLane) score += 5;
    if (station.isOpen) score += 10;

    return score;
  }

  // Get Smart Recommendation
  public getSmartRecommendation(userLat?: number, userLon?: number): {
    station: CNGStation;
    reason: string;
    timeSavedEstimateMinutes: number;
  } | null {
    const list = this.getStations(userLat, userLon);
    const availableStations = list.filter(s => s.availability === 'available' && s.isOpen);
    if (availableStations.length === 0) return null;

    // Sort by recommendation score
    availableStations.sort((a, b) => this.calculateRecommendationScore(b) - this.calculateRecommendationScore(a));
    const best = availableStations[0];

    // Compare with the absolute closest station
    const nearestAny = [...list].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))[0];
    let timeSaved = 0;
    if (nearestAny && nearestAny.id !== best.id && nearestAny.estimatedWaitMinutes > best.estimatedWaitMinutes) {
      timeSaved = Math.max(0, nearestAny.estimatedWaitMinutes - best.estimatedWaitMinutes);
    } else {
      timeSaved = 15;
    }

    let reason = `${best.distanceKm} km away • CNG Available • ${best.estimatedWaitMinutes} min wait`;
    if (best.queueLength === 'short') {
      reason += ` (Short queue of ~${best.queueCount || 3} vehicles)`;
    }
    if ((best.pressureBar ?? 0) >= 215) {
      reason += ` • High pressure ${best.pressureBar} bar`;
    }

    return {
      station: best,
      reason,
      timeSavedEstimateMinutes: timeSaved
    };
  }

  // Submit User Status Report
  public submitReport(
    reportData: Omit<UserReport, 'id' | 'timestamp' | 'upvotes' | 'hasUserUpvoted' | 'userNickname' | 'vehicleType'>
  ): { success: boolean; updatedStation: CNGStation; report: UserReport; karmaGained: number } {
    const karmaGained = 15;
    const newReport: UserReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userNickname: this.profile.nickname,
      vehicleType: this.profile.vehicleType,
      upvotes: 1,
      hasUserUpvoted: true
    };

    this.reports.unshift(newReport);

    // Update target station in internal store
    const stationIndex = this.stations.findIndex(s => s.id === reportData.stationId);
    if (stationIndex !== -1) {
      const current = this.stations[stationIndex];
      let waitMins = current.estimatedWaitMinutes;
      if (reportData.queueLength === 'short') waitMins = Math.floor(Math.random() * 5) + 5; // 5-9 mins
      else if (reportData.queueLength === 'medium') waitMins = Math.floor(Math.random() * 10) + 15; // 15-24 mins
      else if (reportData.queueLength === 'long') waitMins = Math.floor(Math.random() * 15) + 30; // 30-45 mins

      if (reportData.availability === 'not_available') {
        waitMins = 0;
      }

      const updated: CNGStation = {
        ...current,
        availability: reportData.availability,
        queueLength: reportData.queueLength,
        queueCount: reportData.estimatedQueueCount ?? (reportData.queueLength === 'short' ? 4 : reportData.queueLength === 'medium' ? 10 : 20),
        estimatedWaitMinutes: waitMins,
        pressureBar: reportData.pressureBar ?? current.pressureBar,
        activeDispensers: reportData.activeDispensers ?? current.activeDispensers,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: this.profile.nickname,
        verifiedReportsCount: current.verifiedReportsCount + 1
      };

      this.stations[stationIndex] = updated;

      // Check if any notification should fire for this station update
      this.checkAndTriggerNotifications(updated);

      // Update user profile stats
      this.profile.reportsSubmitted += 1;
      this.profile.communityKarma += karmaGained;
      if (this.profile.reportsSubmitted >= 10) this.profile.badge = 'Master Scout';
      else if (this.profile.reportsSubmitted >= 5) this.profile.badge = 'Platinum Contributor';

      this.saveToStorage();

      return {
        success: true,
        updatedStation: updated,
        report: newReport,
        karmaGained
      };
    }

    this.saveToStorage();
    throw new Error('Station not found');
  }

  // Upvote community report
  public upvoteReport(reportId: string): UserReport | undefined {
    const rep = this.reports.find(r => r.id === reportId);
    if (rep) {
      if (rep.hasUserUpvoted) {
        rep.upvotes = Math.max(0, rep.upvotes - 1);
        rep.hasUserUpvoted = false;
      } else {
        rep.upvotes += 1;
        rep.hasUserUpvoted = true;
      }
      this.saveToStorage();
      return rep;
    }
    return undefined;
  }

  // Get reports for a station or all recent
  public getReports(stationId?: string): UserReport[] {
    if (stationId) {
      return this.reports.filter(r => r.stationId === stationId);
    }
    return this.reports;
  }

  // Favorites
  public toggleFavorite(stationId: string): boolean {
    const index = this.profile.favoriteStationIds.indexOf(stationId);
    let isFav = false;
    if (index > -1) {
      this.profile.favoriteStationIds.splice(index, 1);
      isFav = false;
    } else {
      this.profile.favoriteStationIds.push(stationId);
      isFav = true;
    }
    this.saveToStorage();
    return isFav;
  }

  public isFavorite(stationId: string): boolean {
    return this.profile.favoriteStationIds.includes(stationId);
  }

  // Notification Preferences
  public getNotificationPreferences(): NotificationPreference[] {
    return this.notificationPreferences;
  }

  public setNotificationPreference(
    stationId: string,
    stationName: string,
    alertWhenAvailable: boolean,
    alertWhenShortQueue: boolean
  ): void {
    const existingIndex = this.notificationPreferences.findIndex(p => p.stationId === stationId);
    if (!alertWhenAvailable && !alertWhenShortQueue) {
      // Remove preference if both false
      if (existingIndex > -1) {
        this.notificationPreferences.splice(existingIndex, 1);
      }
    } else {
      const pref: NotificationPreference = {
        stationId,
        stationName,
        alertWhenAvailable,
        alertWhenShortQueue,
        createdAt: new Date().toISOString()
      };
      if (existingIndex > -1) {
        this.notificationPreferences[existingIndex] = pref;
      } else {
        this.notificationPreferences.push(pref);
      }
    }
    this.saveToStorage();
  }

  public getNotificationPreferenceForStation(stationId: string): NotificationPreference | undefined {
    return this.notificationPreferences.find(p => p.stationId === stationId);
  }

  // In-app Notifications
  public getNotificationItems(): NotificationItem[] {
    return this.notificationItems;
  }

  public markNotificationAsRead(id: string): void {
    const item = this.notificationItems.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.saveToStorage();
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notificationItems.forEach(n => (n.read = true));
    this.saveToStorage();
  }

  private checkAndTriggerNotifications(station: CNGStation): void {
    const pref = this.notificationPreferences.find(p => p.stationId === station.id);
    if (!pref) return;

    if (pref.alertWhenAvailable && station.availability === 'available') {
      this.notificationItems.unshift({
        id: `notif-${Date.now()}-avail`,
        stationId: station.id,
        stationName: station.name,
        title: '🟢 CNG is Available!',
        message: `${station.name} is now dispensing CNG with ~${station.estimatedWaitMinutes} min wait.`,
        timestamp: new Date().toISOString(),
        type: 'available',
        read: false
      });
    }

    if (pref.alertWhenShortQueue && station.queueLength === 'short') {
      this.notificationItems.unshift({
        id: `notif-${Date.now()}-queue`,
        stationId: station.id,
        stationName: station.name,
        title: '⚡ Short Queue Alert',
        message: `Queue cleared at ${station.name}! Current wait is only ~${station.estimatedWaitMinutes} minutes.`,
        timestamp: new Date().toISOString(),
        type: 'queue_drop',
        read: false
      });
    }
  }

  // Simulate a live community event (for testing prototype)
  public simulateRandomUpdate(): { updatedStation: CNGStation; message: string } {
    const randomIndex = Math.floor(Math.random() * this.stations.length);
    const station = this.stations[randomIndex];
    
    // Toggle or update status
    const availOptions: ('available' | 'uncertain' | 'not_available')[] = ['available', 'available', 'uncertain'];
    const newAvail = availOptions[Math.floor(Math.random() * availOptions.length)];
    const queueOptions: ('short' | 'medium' | 'long')[] = ['short', 'medium', 'long'];
    const newQueue = queueOptions[Math.floor(Math.random() * queueOptions.length)];
    const wait = newQueue === 'short' ? 7 : newQueue === 'medium' ? 18 : 35;

    const updated: CNGStation = {
      ...station,
      availability: newAvail,
      queueLength: newQueue,
      estimatedWaitMinutes: newAvail === 'not_available' ? 0 : wait,
      queueCount: newQueue === 'short' ? 4 : newQueue === 'medium' ? 11 : 22,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'Live Simulation Bot',
      verifiedReportsCount: station.verifiedReportsCount + 1
    };

    this.stations[randomIndex] = updated;

    const report: UserReport = {
      id: `sim-${Date.now()}`,
      stationId: updated.id,
      stationName: updated.name,
      availability: newAvail,
      queueLength: newQueue,
      estimatedQueueCount: updated.queueCount,
      pressureBar: updated.pressureBar,
      activeDispensers: updated.activeDispensers,
      notes: `Live update: Status changed to ${newAvail.toUpperCase()}, queue is ${newQueue}.`,
      tags: ['Live Feed', 'Auto-Telemetry'],
      timestamp: new Date().toISOString(),
      userNickname: 'Telemetry_Bot',
      vehicleType: 'cab',
      upvotes: 2,
      hasUserUpvoted: false
    };
    this.reports.unshift(report);

    this.checkAndTriggerNotifications(updated);
    this.saveToStorage();

    return {
      updatedStation: updated,
      message: `Simulated update applied to ${updated.name}`
    };
  }

  // Profile management
  public getProfile(): UserProfile {
    return this.profile;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.profile = { ...this.profile, ...updates };
    this.saveToStorage();
    return this.profile;
  }

  // Reset to initial mock data
  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.STATIONS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIF_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    this.loadFromStorage();
  }
}

export const stationService = new StationService();
