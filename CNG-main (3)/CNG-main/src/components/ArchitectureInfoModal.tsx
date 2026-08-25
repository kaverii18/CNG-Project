import React, { useState } from 'react';
import { X, Layers, Database, Radio, Cpu, Cloud, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureInfoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'architecture' | 'data' | 'firebase' | 'telemetry'>('architecture');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="architecture-info-modal"
        className="w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System Architecture & Technical Specs</h3>
              <p className="text-xs text-slate-500">Production blueprint for CNG Finder</p>
            </div>
          </div>

          <button
            id="btn-close-arch-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {[
            { id: 'architecture', label: '1. Architecture', icon: Layers },
            { id: 'data', label: '2. Current Data Flow', icon: Database },
            { id: 'firebase', label: '3. Firebase Roadmap', icon: Cloud },
            { id: 'telemetry', label: '4. Real-time Telemetry', icon: Cpu },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Frontend Architecture Overview
                </h4>
                <p>
                  CNG Finder is built using a clean <strong>Repository & Service Abstraction Pattern</strong> in React 19 + TypeScript + Tailwind CSS.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Presentation Layer:</strong> Highly optimized mobile-first UI components with interactive Leaflet GIS mapping, dynamic status badges, and animated sheets.</li>
                  <li><strong>Domain & Business Logic Layer:</strong> Station Scoring Engine (`getSmartRecommendation`), Haversine GIS distance calculations, queue wait estimation algorithms.</li>
                  <li><strong>Service Layer (`StationService`):</strong> An isolated data adapter managing CRUD, filtering, notifications, and local persistence.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-blue-50/60 border border-blue-200 p-4 space-y-2">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Smart Recommendation Scoring Formula
                </h4>
                <p className="font-mono text-[11px] bg-white p-2.5 rounded-lg text-blue-700 border border-blue-200">
                  Score = AvailabilityBase (100) - (DistanceKm × 7) - (WaitMinutes × 1.8) + PressureBonus (12 if ≥ 210 bar) + AutoLaneBonus (5)
                </p>
                <p className="text-slate-600">
                  This prioritizes stations that minimize total turnaround time (Drive Time + Queue Wait) rather than blindly suggesting the geographically closest station with a 45-minute queue.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  How Station Data Currently Works (Prototype State)
                </h4>
                <p>
                  In this prototype, data is initialized from realistic station seeds (12 metro stations across IGL, HPCL, BPCL, IOCL, Adani Gas, MGL) and persisted in <strong>Browser LocalStorage</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900">1. Crowd-Sourced Updates</h5>
                  <p className="text-slate-600">
                    When a user posts a status report, it updates the station's availability, recalculates wait times, creates a community report entry, and rewards the user with +15 Karma points.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900">2. Notification Triggers</h5>
                  <p className="text-slate-600">
                    The service checks active user subscriptions (e.g. "Notify when available") and dispatches in-app alerts immediately when a matching report or telemetry event arrives.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900">3. Geolocation Engine</h5>
                  <p className="text-slate-600">
                    Uses standard W3C `navigator.geolocation` with fallback to South Delhi hub center point. Dynamically calculates distances and estimated driving times.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900">4. Decay & Confidence</h5>
                  <p className="text-slate-600">
                    Stations clearly display "Last updated X mins ago" and report verification counts to prevent stale assumptions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  Which Parts Need Firebase Integration
                </h4>
                <p>
                  To transition from MVP prototype to full production, the `StationService` is ready to swap LocalStorage with Firebase:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-blue-600">1.</span>
                  <div>
                    <strong className="text-slate-900">Firestore `stations` Collection:</strong>
                    <p className="text-slate-600">Central database storing geo-points, active status, queue metrics, and pump pressures with real-time `onSnapshot` listeners.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-blue-600">2.</span>
                  <div>
                    <strong className="text-slate-900">Firestore `reports` Subcollection:</strong>
                    <p className="text-slate-600">Immutable ledger of driver reports with Cloud Functions aggregating reports to calculate trust-weighted average queue times.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-blue-600">3.</span>
                  <div>
                    <strong className="text-slate-900">Firebase Authentication (Auth):</strong>
                    <p className="text-slate-600">Phone OTP / Google Sign-in to authenticate drivers, prevent spam reports, and manage driver karma ranks.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-blue-600">4.</span>
                  <div>
                    <strong className="text-slate-900">Firebase Cloud Messaging (FCM):</strong>
                    <p className="text-slate-600">Push notifications to mobile devices when a favorited station resumes CNG supply.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  How Real-Time CNG Availability Could Be Implemented
                </h4>
                <p>
                  Achieving 100% automated real-time CNG tracking requires combining three complementary data sources:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-blue-700 mb-1">
                    <Radio className="w-4 h-4 text-blue-600" />
                    Tier 1: SCADA & IoT Gas Flowmeters
                  </div>
                  <p className="text-slate-600">
                    Integration with city gas distribution SCADA systems (e.g. IGL/MGL APIs) or IoT pressure sensors directly on station compressor manifolds to read live bar pressure and flow rates.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 mb-1">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    Tier 2: AI Computer Vision on Queue Cameras
                  </div>
                  <p className="text-slate-600">
                    Edge AI cameras (YOLO object detection) installed at station approach lanes to automatically count waiting vehicles and compute exact dispenser turnaround speed.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-blue-700 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Tier 3: Crowdsourced Driver Telemetry (Waze-style)
                  </div>
                  <p className="text-slate-600">
                    Passive geofencing inside driver apps (detecting when an auto/cab slows to &lt; 5 km/h inside a station polygon) combined with active 1-tap confirmation reports.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">CNG Finder MVP Architectural Blueprint</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
