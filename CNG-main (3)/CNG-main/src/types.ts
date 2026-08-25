export type CNGAvailability = 'available' | 'not_available' | 'uncertain';

export type QueueLength = 'short' | 'medium' | 'long';

export type StationBrand = 
  | 'Indraprastha Gas (IGL)' 
  | 'Mahanagar Gas (MGL)' 
  | 'Adani Total Gas' 
  | 'HPCL CNG' 
  | 'BPCL CNG' 
  | 'IOCL CNG' 
  | 'Torrent Gas' 
  | 'Gujarat Gas';

export interface CNGStation {
  id: string;
  name: string;
  brand: StationBrand;
  address: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  availability: CNGAvailability;
  queueLength: QueueLength;
  estimatedWaitMinutes: number;
  queueCount?: number; // approximate number of vehicles
  pressureBar?: number; // Gas pressure e.g. 215 bar (crucial for CNG mileage)
  dispensersCount: number;
  activeDispensers: number;
  lastUpdated: string; // ISO string
  lastUpdatedBy?: string;
  verifiedReportsCount: number;
  isOpen: boolean;
  operatingHours: string;
  rating: number;
  reviewsCount: number;
  hasDedicatedAutoLane: boolean;
  acceptsDigitalPayment: boolean;
  distanceKm?: number;
  drivingEtaMinutes?: number;
  phone?: string;
}

export interface UserReport {
  id: string;
  stationId: string;
  stationName: string;
  availability: CNGAvailability;
  queueLength: QueueLength;
  estimatedQueueCount?: number;
  pressureBar?: number;
  activeDispensers?: number;
  notes?: string;
  tags?: string[];
  timestamp: string;
  userNickname: string;
  vehicleType: 'auto' | 'cab' | 'private_car' | 'commercial';
  upvotes: number;
  hasUserUpvoted?: boolean;
}

export interface NotificationPreference {
  stationId: string;
  stationName: string;
  alertWhenAvailable: boolean;
  alertWhenShortQueue: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  stationId?: string;
  stationName?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'available' | 'queue_drop' | 'crowd_update' | 'system';
  read: boolean;
}

export interface UserProfile {
  nickname: string;
  vehicleType: 'auto' | 'cab' | 'private_car' | 'commercial';
  fuelTankCapacityKg: number;
  favoriteStationIds: string[];
  reportsSubmitted: number;
  communityKarma: number;
  badge: string;
}

export type SortOption = 'recommended' | 'distance' | 'wait_time' | 'queue_length';

export interface FilterOptions {
  searchQuery: string;
  availability: 'all' | 'available' | 'uncertain' | 'not_available';
  maxWaitMinutes?: number;
  openOnly: boolean;
  highPressureOnly: boolean;
  digitalPaymentOnly: boolean;
}
