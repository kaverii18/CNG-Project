import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CNGStation } from '../types';
import { Crosshair, Layers, Navigation, RefreshCw, ZoomIn, ZoomOut, Flame, Clock, Car } from 'lucide-react';

interface Props {
  stations: CNGStation[];
  userLocation: { latitude: number; longitude: number; areaName: string };
  selectedStation: CNGStation | null;
  onSelectStation: (station: CNGStation) => void;
  onUseMyLocation: () => void;
  isLocating: boolean;
  filterAvailability: 'all' | 'available' | 'short_queue';
  onFilterChange: (filter: 'all' | 'available' | 'short_queue') => void;
}

export const MapView: React.FC<Props> = ({
  stations,
  userLocation,
  selectedStation,
  onSelectStation,
  onUseMyLocation,
  isLocating,
  filterAvailability,
  onFilterChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager clean light tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User Location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userIcon = L.divIcon({
      className: 'custom-user-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip('You are here', { permanent: false, direction: 'top' });
    }
  }, [userLocation]);

  // Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Filter stations for map display
    let visibleStations = stations;
    if (filterAvailability === 'available') {
      visibleStations = stations.filter(s => s.availability === 'available');
    } else if (filterAvailability === 'short_queue') {
      visibleStations = stations.filter(s => s.availability === 'available' && s.queueLength === 'short');
    }

    visibleStations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;

      // Color coding & icon
      let statusBg = 'bg-emerald-600 text-white';
      let waitBadgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';

      if (station.availability === 'uncertain') {
        statusBg = 'bg-amber-500 text-white';
        waitBadgeBg = 'bg-amber-50 text-amber-900 border-amber-200';
      } else if (station.availability === 'not_available') {
        statusBg = 'bg-rose-500 text-white';
        waitBadgeBg = 'bg-rose-50 text-rose-900 border-rose-200';
      }

      const waitText = station.availability === 'not_available' ? 'No CNG' : `~${station.estimatedWaitMinutes}m`;

      const markerHtml = `
        <div class="relative group cursor-pointer transform transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
          ${isSelected ? `<div class="absolute -inset-2 rounded-full ${statusBg}/30 animate-ping"></div>` : ''}
          
          <div class="flex flex-col items-center">
            <!-- Wait time mini pill -->
            <div class="px-1.5 py-0.5 rounded-md text-[10px] font-bold border shadow-xs flex items-center gap-1 mb-0.5 ${waitBadgeBg} whitespace-nowrap">
              <span>${waitText}</span>
            </div>

            <!-- Pin Head -->
            <div class="w-8 h-8 rounded-full ${statusBg} border-2 border-white shadow-md flex items-center justify-center font-bold text-xs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
            </div>

            <!-- Pin Arrow Point -->
            <div class="w-2 h-2 rotate-45 ${statusBg} -mt-1 border-r border-b border-white"></div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'cng-custom-marker',
        html: markerHtml,
        iconSize: [60, 60],
        iconAnchor: [30, 48],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon })
        .addTo(markersLayer)
        .on('click', () => {
          onSelectStation(station);
          map.panTo([station.latitude, station.longitude], { animate: true, duration: 0.5 });
        });
    });
  }, [stations, selectedStation, filterAvailability, onSelectStation]);

  // Center on selected station if it changes
  useEffect(() => {
    if (selectedStation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedStation.latitude, selectedStation.longitude], {
        animate: true,
        duration: 0.6,
      });
    }
  }, [selectedStation]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapInstanceRef.current?.setView([userLocation.latitude, userLocation.longitude], 14, {
      animate: true,
    });
    onUseMyLocation();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {/* Map Tile Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm pointer-events-auto overflow-x-auto">
          <button
            id="map-filter-all"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              filterAvailability === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            All Stations ({stations.length})
          </button>
          <button
            id="map-filter-available"
            onClick={() => onFilterChange('available')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              filterAvailability === 'available'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Available Only ({stations.filter(s => s.availability === 'available').length})
          </button>
          <button
            id="map-filter-short-queue"
            onClick={() => onFilterChange('short_queue')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              filterAvailability === 'short_queue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            ⚡ Short Queue (&lt;15m)
          </button>
        </div>
      </div>

      {/* Map Action Floating Controls */}
      <div className="absolute right-3 top-16 z-10 flex flex-col gap-2 pointer-events-auto">
        <button
          id="btn-map-my-location"
          onClick={handleRecenter}
          disabled={isLocating}
          className={`p-2.5 rounded-2xl bg-white/95 text-slate-700 border border-slate-200 shadow-md backdrop-blur-md hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center ${
            isLocating ? 'text-blue-600 animate-pulse' : ''
          }`}
          title="Recenter to my location"
        >
          <Crosshair className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        <div className="flex flex-col rounded-2xl bg-white/95 border border-slate-200 shadow-md backdrop-blur-md overflow-hidden">
          <button
            id="btn-map-zoom-in"
            onClick={handleZoomIn}
            className="p-2.5 text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-map-zoom-out"
            onClick={handleZoomOut}
            className="p-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Badge Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-[11px] flex items-center gap-3 text-slate-700 pointer-events-none font-medium">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Uncertain
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Gas
        </span>
      </div>
    </div>
  );
};
