import { useState } from 'react';
import { SimulationModule } from '../types';
import { useSimulationRuntime } from '../runtime';
import { PlaybackBar } from '../components/PlaybackBar';
import { ErrorFallback } from '../components/ErrorFallback';
import { validateSimulationModule, checkSDKCompatibility } from '../validation';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Code2, FlaskConical, Info } from 'lucide-react';

export interface SimulationPreviewHarnessProps<TState, TConfig, TStepLog = unknown> {
  module: SimulationModule<TState, TConfig, TStepLog>;
  title?: string;
  initialSpeedMs?: number;
}

/**
 * Contributor development harness.
 * Mounts any standard SimulationModule in complete isolation from the platform.
 */
export function SimulationPreviewHarness<TState, TConfig, TStepLog = unknown>({
  module,
  title = 'REC-LABS DEV HARNESS',
}: SimulationPreviewHarnessProps<TState, TConfig, TStepLog>) {
  const runtime = useSimulationRuntime(module);
  const [activeTab, setActiveTab] = useState<'sim' | 'content' | 'inspector'>('sim');
  const [validationExpanded, setValidationExpanded] = useState<boolean>(false);

  // Validate module and check SDK compatibility
  const validation = validateSimulationModule(module);
  const compatibility = checkSDKCompatibility(module.metadata.sdkVersion);

  const completion =
    runtime.status === 'completed' && module.completionSummary
      ? module.completionSummary(runtime.state, runtime.config)
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Harness Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
                {title}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600 uppercase font-mono">
                {module.metadata.topicId} / {module.metadata.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">v{module.metadata.version}</span>
              <span className="text-slate-300">•</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                  compatibility.status === 'compatible'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : compatibility.status === 'unknown'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                SDK: {compatibility.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {module.metadata.title}
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl mt-1 leading-relaxed">
              {module.metadata.shortDescription}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('sim')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sim'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Simulation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Educational Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'inspector'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              State Inspector
            </button>
          </div>
        </header>

        {/* Validation & Diagnostics Accordion */}
        {(!validation.valid || validation.warnings.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
            <button
              type="button"
              onClick={() => setValidationExpanded(!validationExpanded)}
              className="w-full flex items-center justify-between font-semibold text-amber-900 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                Contract Conformance: {validation.errors.length} error(s), {validation.warnings.length} warning(s)
              </span>
              {validationExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {validationExpanded && (
              <div className="mt-3 pt-3 border-t border-amber-200 space-y-1">
                {validation.errors.map((e, i) => (
                  <div key={i} className="text-rose-700 font-mono">
                    [ERROR] {e.field}: {e.message}
                  </div>
                ))}
                {validation.warnings.map((w, i) => (
                  <div key={i} className="text-amber-800 font-mono">
                    [WARN] {w.field}: {w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Workspace Body */}
        {activeTab === 'sim' && (
          <div className="flex flex-col gap-6">
            {/* Playback Control Bar */}
            <PlaybackBar
              status={runtime.status}
              stepCount={runtime.stepCount}
              speedMs={runtime.speedMs}
              onPlay={runtime.play}
              onPause={runtime.pause}
              onStep={runtime.step}
              onSubStep={runtime.subStep}
              hasSubStep={runtime.hasSubStep}
              onReset={runtime.reset}
              onSpeedChange={runtime.setSpeedMs}
            />

            {/* Runtime Error Fallback */}
            {runtime.status === 'error' && (
              <ErrorFallback
                error={runtime.errorMessage}
                onReset={runtime.reset}
                simulationTitle={module.metadata.title}
              />
            )}

            {/* Completion Banner */}
            {completion && (
              <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {completion.title}
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed">
                  {completion.description}
                </p>
                {completion.analysis && (
                  <div className="mt-2 p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-slate-700">
                    <span className="font-bold text-emerald-950 block mb-1">
                      {completion.analysis.title}
                    </span>
                    <p>{completion.analysis.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Split Visualization and Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Visualization Stage */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[460px]">
                <module.Visualization
                  state={runtime.state}
                  config={runtime.config}
                  isRunning={runtime.status === 'running'}
                  stepCount={runtime.stepCount}
                  lastStepLog={runtime.lastStepLog}
                  speedMs={runtime.speedMs}
                  onUpdateState={runtime.updateState}
                />
              </div>

              {/* Controls Panel */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">
                    Simulation Controls
                  </h3>
                  <module.Controls
                    state={runtime.state}
                    config={runtime.config}
                    onChangeConfig={runtime.updateConfig}
                    onUpdateState={runtime.updateState}
                    disabled={runtime.status === 'running'}
                  />
                </div>

                {/* Custom State Inspector if provided */}
                {module.StateInspector && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">
                      Simulation Inspector
                    </h3>
                    <module.StateInspector
                      state={runtime.state}
                      config={runtime.config}
                      lastStepLog={runtime.lastStepLog}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Educational Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Introduction</h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {module.content.introduction}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Theoretical Background</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {module.content.theory}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">How It Works</h2>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
                {module.content.howItWorks.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {module.content.keyFormulas && module.content.keyFormulas.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Key Formulas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.content.keyFormulas.map((f, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="font-semibold text-xs text-slate-600 mb-1">{f.label}</div>
                      <div className="font-mono text-sm font-bold text-blue-700 mb-2">{f.formula}</div>
                      <div className="text-xs text-slate-600">{f.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {module.content.references && module.content.references.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Educational References</h2>
                <ul className="space-y-2">
                  {module.content.references.map((ref, idx) => (
                    <li key={idx} className="text-xs">
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {ref.title}
                      </a>
                      {ref.description && <p className="text-slate-500 mt-0.5">{ref.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* State & Logs Inspector Tab */}
        {activeTab === 'inspector' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-500 mb-3">
                Live State Object
              </h3>
              <pre className="bg-slate-50 text-slate-800 border border-slate-200 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[500px]">
                {JSON.stringify(runtime.state, null, 2)}
              </pre>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-500 mb-3">
                Active Configuration
              </h3>
              <pre className="bg-slate-50 text-slate-800 border border-slate-200 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[500px]">
                {JSON.stringify(runtime.config, null, 2)}
              </pre>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-500 mb-3">
                Last Step Log (Step {runtime.stepCount})
              </h3>
              <pre className="bg-slate-50 text-slate-800 border border-slate-200 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[500px]">
                {JSON.stringify(runtime.lastStepLog ?? { message: 'No step executed yet' }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
