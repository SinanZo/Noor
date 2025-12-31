import React, { useRef, useEffect, useState } from 'react';

interface TimelineABProps {
  /** Total number of ayahs in surah */
  total: number;
  /** Current playback position (1-based) */
  current: number;
  /** A-B repeat start marker (1-based, null if disabled) */
  aMark: number | null;
  /** A-B repeat end marker (1-based, null if disabled) */
  bMark: number | null;
  /** Callback when current position changes (user drags main slider) */
  onCurrentChange: (ayah: number) => void;
  /** Callback when A marker changes */
  onAChange: (ayah: number | null) => void;
  /** Callback when B marker changes */
  onBChange: (ayah: number | null) => void;
}

export default function TimelineAB({
  total,
  current,
  aMark,
  bMark,
  onCurrentChange,
  onAChange,
  onBChange,
}: TimelineABProps) {
  const [isDraggingCurrent, setIsDraggingCurrent] = useState(false);
  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate percentages for visual positioning
  const currentPercent = ((current - 1) / (total - 1)) * 100;
  const aPercent = aMark ? ((aMark - 1) / (total - 1)) * 100 : 0;
  const bPercent = bMark ? ((bMark - 1) / (total - 1)) * 100 : 0;

  // Calculate loop range width and position
  const loopStart = aMark && bMark ? Math.min(aPercent, bPercent) : 0;
  const loopWidth = aMark && bMark ? Math.abs(bPercent - aPercent) : 0;

  // Convert pixel position to ayah number
  const getAyahFromPosition = (clientX: number): number => {
    if (!containerRef.current) return 1;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const ayah = Math.round(percent * (total - 1)) + 1;
    return Math.max(1, Math.min(ayah, total));
  };

  // Mouse/touch move handler
  const handleMove = (clientX: number) => {
    const ayah = getAyahFromPosition(clientX);
    if (isDraggingCurrent) onCurrentChange(ayah);
    if (isDraggingA) onAChange(ayah);
    if (isDraggingB) onBChange(ayah);
  };

  // Global mouse move/up handlers
  useEffect(() => {
    if (!isDraggingCurrent && !isDraggingA && !isDraggingB) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleEnd = () => {
      setIsDraggingCurrent(false);
      setIsDraggingA(false);
      setIsDraggingB(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingCurrent, isDraggingA, isDraggingB, total]);

  return (
    <div className="space-y-2">
      {/* Labels */}
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Ayah {current} of {total}</span>
        {aMark && bMark && (
          <span className="text-blue-600 dark:text-blue-400">
            Loop: {Math.min(aMark, bMark)}-{Math.max(aMark, bMark)}
          </span>
        )}
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="relative h-12 cursor-pointer select-none"
        onMouseDown={(e) => {
          // Click on track to jump current position
          if (e.target === e.currentTarget) {
            const ayah = getAyahFromPosition(e.clientX);
            onCurrentChange(ayah);
          }
        }}
      >
        {/* Track */}
        <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          {/* Loop Range Highlight */}
          {aMark && bMark && (
            <div
              className="absolute h-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 dark:from-blue-600/30 dark:to-purple-600/30 rounded-full"
              style={{
                left: `${loopStart}%`,
                width: `${loopWidth}%`,
              }}
            />
          )}

          {/* Progress (from start to current) */}
          <div
            className="absolute h-full bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-600 dark:to-blue-600 rounded-full"
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* Current Position Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing z-30"
          style={{ left: `${currentPercent}%`, transform: 'translate(-50%, -50%)' }}
          onMouseDown={() => setIsDraggingCurrent(true)}
          onTouchStart={() => setIsDraggingCurrent(true)}
        >
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">
            ▶
          </div>
        </div>

        {/* A Marker Thumb */}
        {aMark && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 dark:bg-green-600 rounded-full shadow cursor-grab active:cursor-grabbing z-20"
            style={{ left: `${aPercent}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={() => setIsDraggingA(true)}
            onTouchStart={() => setIsDraggingA(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
          </div>
        )}

        {/* B Marker Thumb */}
        {bMark && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-purple-500 dark:bg-purple-600 rounded-full shadow cursor-grab active:cursor-grabbing z-20"
            style={{ left: `${bPercent}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={() => setIsDraggingB(true)}
            onTouchStart={() => setIsDraggingB(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              B
            </div>
          </div>
        )}
      </div>

      {/* A-B Controls */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => onAChange(current)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Set A ({current})
        </button>
        <button
          onClick={() => onBChange(current)}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Set B ({current})
        </button>
        {(aMark || bMark) && (
          <button
            onClick={() => {
              onAChange(null);
              onBChange(null);
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear A-B
          </button>
        )}
      </div>
    </div>
  );
}
