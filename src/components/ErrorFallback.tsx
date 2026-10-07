import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error | string | null;
  onReset: () => void;
  simulationTitle?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onReset,
  simulationTitle = 'Simulation',
}) => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || 'An unexpected runtime error occurred.';

  return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-4 text-slate-900 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-rose-900 text-base">
            {simulationTitle} Module Execution Error
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            The simulation logic encountered an error during a step transition. The platform core prevented this from breaking the application.
          </p>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-lg border border-rose-200 font-mono text-xs text-rose-700 overflow-x-auto shadow-2xs">
        <code>{errorMessage}</code>
      </div>

      <div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer transition-all"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          Reset Simulation State
        </button>
      </div>
    </div>
  );
};
