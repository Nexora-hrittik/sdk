import React from 'react';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  valueDisplay?: string | number;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  valueDisplay,
  unit = '',
}) => {
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <div className="flex justify-between items-center text-slate-700">
        <label className="font-semibold text-slate-800">{label}</label>
        <span className="font-mono text-blue-700 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
          {valueDisplay !== undefined ? valueDisplay : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />
    </div>
  );
};
