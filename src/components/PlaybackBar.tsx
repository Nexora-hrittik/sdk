import React from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import { SimulationStatus } from '../types';

export interface PlaybackBarProps {
  status: SimulationStatus;
  stepCount: number;
  speedMs: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onSubStep?: () => void;
  hasSubStep?: boolean;
  onReset: () => void;
  onSpeedChange: (ms: number) => void;
  onAnalyze?: () => void;
  hideTelemetry?: boolean;
  className?: string;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  status,
  stepCount,
  speedMs,
  onPlay,
  onPause,
  onStep,
  onSubStep,
  hasSubStep,
  onReset,
  onSpeedChange,
  hideTelemetry = false,
  className = '',
}) => {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';

  const statusBadge = {
    idle: (
      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
        READY
      </span>
    ),
    running: (
      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
        RUNNING
      </span>
    ),
    paused: (
      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
        PAUSED
      </span>
    ),
    completed: (
      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        COMPLETED
      </span>
    ),
    error: (
      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
        ERROR
      </span>
    ),
  }[status];

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 bg-white border border-zinc-200 rounded-xl shadow-2xs transition-all ${className}`}>
      {/* Dynamic Action Buttons based on current simulation state */}
      <div className="flex items-center gap-2 flex-wrap">
        {isRunning && (
          <button
            type="button"
            onClick={onPause}
            title="Pause simulation execution"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 cursor-pointer transition-colors"
          >
            <Pause className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            Pause
          </button>
        )}

        {isPaused && (
          <>
            <button
              type="button"
              onClick={onPlay}
              title="Resume simulation"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Resume
            </button>
            <button
              type="button"
              onClick={onStep}
              title="Execute next step"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 cursor-pointer transition-colors"
            >
              <StepForward className="w-3.5 h-3.5 text-zinc-700" />
              Next Step
            </button>
            {hasSubStep && onSubStep && (
              <button
                type="button"
                onClick={onSubStep}
                title="Advance single intermediate phase"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 shadow-2xs cursor-pointer transition-colors"
              >
                Sub-Step
              </button>
            )}
          </>
        )}

        {status === 'idle' && (
          <>
            <button
              type="button"
              onClick={onPlay}
              title="Start simulation"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Simulation
            </button>
            <button
              type="button"
              onClick={onStep}
              title="Step through single sample"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 cursor-pointer transition-colors"
            >
              <StepForward className="w-3.5 h-3.5 text-zinc-700" />
              Step
            </button>
            {hasSubStep && onSubStep && (
              <button
                type="button"
                onClick={onSubStep}
                title="Advance single intermediate phase"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 shadow-2xs cursor-pointer transition-colors"
              >
                Sub-Step
              </button>
            )}
          </>
        )}

        {isCompleted && (
          <button
            type="button"
            onClick={onReset}
            title="Reset and start over"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
            Reset Experiment
          </button>
        )}

        {/* Global Reset when paused or running */}
        {(isRunning || isPaused) && (
          <button
            type="button"
            onClick={onReset}
            title="Reset to initial parameters"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 shadow-2xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-zinc-500" />
            Reset
          </button>
        )}
      </div>

      {/* Speed Selector, and optional Steps Count & Status Badge */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Speed Adjustment */}
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
          <span className="hidden sm:inline font-sans font-mono text-[11px] text-zinc-400">Speed:</span>
          <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            {[
              { label: '0.5x', ms: 600 },
              { label: '1x', ms: 300 },
              { label: '2x', ms: 120 },
              { label: '5x', ms: 40 },
            ].map(({ label, ms }) => (
              <button
                key={label}
                type="button"
                onClick={() => onSpeedChange(ms)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                  speedMs === ms
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
                title={`Set speed multiplier to ${label}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Step Counter & Status Badge when not integrated in header */}
        {!hideTelemetry && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium font-sans">
              <span className="font-mono text-[11px] text-zinc-400">Steps:</span>
              <span className="font-mono text-zinc-900 font-bold bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 min-w-8 text-center text-xs">
                {stepCount}
              </span>
            </div>

            <div>{statusBadge}</div>
          </>
        )}
      </div>
    </div>
  );
};
