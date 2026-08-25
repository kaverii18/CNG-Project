import React, { useState } from 'react';
import { CNGStation, CNGAvailability, QueueLength } from '../types';
import { X, CheckCircle2, AlertTriangle, XCircle, Car, Gauge, Sparkles, Send, Tag } from 'lucide-react';

interface Props {
  station: CNGStation | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: {
    stationId: string;
    stationName: string;
    availability: CNGAvailability;
    queueLength: QueueLength;
    estimatedQueueCount?: number;
    pressureBar?: number;
    activeDispensers?: number;
    notes?: string;
    tags?: string[];
  }) => void;
}

const COMMON_TAGS = [
  'Dedicated Auto Lane Open',
  'UPI QR Working',
  'Fast Flow Rate',
  'Card Machine Down',
  'Only 2 Dispensers Working',
  'Tanker Unloading'
];

export const StatusUpdateModal: React.FC<Props> = ({
  station,
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen || !station) return null;

  const [availability, setAvailability] = useState<CNGAvailability>(station.availability);
  const [queueLength, setQueueLength] = useState<QueueLength>(station.queueLength);
  const [queueCount, setQueueCount] = useState<number>(station.queueCount || 5);
  const [pressureBar, setPressureBar] = useState<number>(station.pressureBar || 210);
  const [notes, setNotes] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmit({
        stationId: station.id,
        stationName: station.name,
        availability,
        queueLength,
        estimatedQueueCount: availability === 'not_available' ? 0 : queueCount,
        pressureBar: availability === 'not_available' ? 0 : pressureBar,
        activeDispensers: availability === 'not_available' ? 0 : station.activeDispensers,
        notes: notes.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      });

      setIsSubmitting(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="status-update-modal"
        className="w-full max-w-lg max-h-[92vh] bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Community Crowd Report
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[280px] sm:max-w-sm">
              Update {station.name}
            </h2>
          </div>

          <button
            id="btn-close-update-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Section 1: Availability Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>1. CNG Availability</span>
              <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-report-available"
                onClick={() => setAvailability('available')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  availability === 'available'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">CNG Available</span>
                <span className="text-[10px] opacity-75">Pumps active</span>
              </button>

              <button
                type="button"
                id="btn-report-uncertain"
                onClick={() => setAvailability('uncertain')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  availability === 'uncertain'
                    ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold">Uncertain</span>
                <span className="text-[10px] opacity-75">Low pressure/tanker</span>
              </button>

              <button
                type="button"
                id="btn-report-unavailable"
                onClick={() => setAvailability('not_available')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  availability === 'not_available'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold">Not Available</span>
                <span className="text-[10px] opacity-75">Out of Gas</span>
              </button>
            </div>
          </div>

          {/* Section 2: Queue Length */}
          {availability !== 'not_available' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>2. Queue Length</span>
                <span className="text-[11px] text-blue-600 font-normal">Select current line status</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-queue-short"
                  onClick={() => {
                    setQueueLength('short');
                    setQueueCount(4);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    queueLength === 'short'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold">Short</span>
                  <span className="text-[11px] opacity-75">&lt; 5 vehicles (~8m)</span>
                </button>

                <button
                  type="button"
                  id="btn-queue-medium"
                  onClick={() => {
                    setQueueLength('medium');
                    setQueueCount(10);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    queueLength === 'medium'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold">Medium</span>
                  <span className="text-[11px] opacity-75">5-15 vehicles (~20m)</span>
                </button>

                <button
                  type="button"
                  id="btn-queue-long"
                  onClick={() => {
                    setQueueLength('long');
                    setQueueCount(20);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    queueLength === 'long'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold">Long</span>
                  <span className="text-[11px] opacity-75">&gt; 15 vehicles (35m+)</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Optional Approximate Vehicle Count */}
          {availability !== 'not_available' && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  Estimated Vehicle Count (Optional)
                </span>
                <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  ~{queueCount} cars/autos
                </span>
              </div>

              <input
                id="range-queue-count"
                type="range"
                min="0"
                max="35"
                step="1"
                value={queueCount}
                onChange={e => setQueueCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 cars (empty)</span>
                <span>15 cars</span>
                <span>35+ cars (crowded)</span>
              </div>
            </div>
          )}

          {/* Section 4: Gas Pressure (Optional) */}
          {availability !== 'not_available' && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-600" />
                  Gas Pressure (Optional)
                </span>
                <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                  {pressureBar} Bar
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[180, 200, 220].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPressureBar(val)}
                    className={`py-1.5 px-2 text-xs rounded-xl border font-mono transition-colors ${
                      pressureBar === val
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {val} Bar {val >= 215 ? '🔥' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Quick Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Quick Station Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Notes / Tips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Driver Notes / Observations (Optional)
            </label>
            <textarea
              id="input-report-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Separate auto line is moving in 5 mins. Card swipe working."
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Community reward incentive banner */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700">You will earn <strong className="text-blue-800">+15 Community Karma</strong></span>
            </div>
            <span className="text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded-full border border-blue-200">
              Driver Verified
            </span>
          </div>

          {/* Success Toast */}
          {showSuccessToast && (
            <div className="bg-emerald-600 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4" />
              Thank you! Status updated and broadcast to nearby drivers.
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-status-report"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 active:scale-98"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Publishing Report...' : 'Submit Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
