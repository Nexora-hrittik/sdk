import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationModule, SimulationStatus } from '../types';

export interface UseSimulationRuntimeReturn<TState, TConfig, TStepLog> {
  state: TState;
  config: TConfig;
  status: SimulationStatus;
  stepCount: number;
  speedMs: number;
  lastStepLog?: TStepLog;
  errorMessage: string | null;
  hasSubStep: boolean;
  play: () => void;
  pause: () => void;
  step: () => void;
  subStep: () => void;
  reset: () => void;
  setSpeedMs: (ms: number) => void;
  updateConfig: (patch: Partial<TConfig>, autoReset?: boolean) => void;
  updateState: (updater: (prevState: TState) => TState) => void;
}

export function useSimulationRuntime<TState, TConfig, TStepLog>(
  module: SimulationModule<TState, TConfig, TStepLog>,
  overrideConfig?: Partial<TConfig>
): UseSimulationRuntimeReturn<TState, TConfig, TStepLog> {
  const [config, setConfig] = useState<TConfig>(() => ({
    ...module.defaultConfig,
    ...overrideConfig,
  }));

  const [state, setState] = useState<TState>(() => module.createInitialState(config));
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [stepCount, setStepCount] = useState<number>(0);
  const [speedMs, setSpeedMs] = useState<number>(300);
  const [lastStepLog, setLastStepLog] = useState<TStepLog | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep references to prevent stale closures in running timers
  const stateRef = useRef(state);
  stateRef.current = state;
  const configRef = useRef(config);
  configRef.current = config;
  const statusRef = useRef(status);
  statusRef.current = status;

  const performStep = useCallback((): boolean => {
    try {
      const result = module.step(stateRef.current, configRef.current);
      setState(result.nextState);
      stateRef.current = result.nextState;
      setStepCount((prev) => prev + 1);
      setLastStepLog(result.stepLog);

      if (result.isComplete) {
        setStatus('completed');
        return false;
      }
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error during simulation step';
      console.error(`Simulation step error:`, err);
      setErrorMessage(msg);
      setStatus('error');
      return false;
    }
  }, [module]);

  const performSubStep = useCallback((): boolean => {
    try {
      const stepFn = module.subStep ?? module.step;
      const result = stepFn(stateRef.current, configRef.current);
      setState(result.nextState);
      stateRef.current = result.nextState;
      setStepCount((prev) => prev + 1);
      setLastStepLog(result.stepLog);

      if (result.isComplete) {
        setStatus('completed');
        return false;
      }
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error during simulation sub-step';
      console.error(`Simulation sub-step error:`, err);
      setErrorMessage(msg);
      setStatus('error');
      return false;
    }
  }, [module]);

  const play = useCallback(() => {
    if (statusRef.current === 'completed' || statusRef.current === 'error') {
      return;
    }
    setErrorMessage(null);
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current === 'running') {
      setStatus('paused');
    }
  }, []);

  const step = useCallback(() => {
    if (statusRef.current === 'running') {
      pause();
    }
    performStep();
  }, [pause, performStep]);

  const subStep = useCallback(() => {
    if (statusRef.current === 'running') {
      pause();
    }
    performSubStep();
  }, [pause, performSubStep]);

  const reset = useCallback(() => {
    try {
      const initial = module.reset
        ? module.reset(configRef.current)
        : module.createInitialState(configRef.current);
      setState(initial);
      stateRef.current = initial;
      setStepCount(0);
      setStatus('idle');
      setLastStepLog(undefined);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resetting simulation';
      setErrorMessage(msg);
      setStatus('error');
    }
  }, [module]);

  const updateConfig = useCallback(
    (patch: Partial<TConfig>, autoReset = true) => {
      const nextConfig = { ...configRef.current, ...patch };
      setConfig(nextConfig);
      configRef.current = nextConfig;
      if (autoReset) {
        try {
          const initial = module.reset
            ? module.reset(nextConfig)
            : module.createInitialState(nextConfig);
          setState(initial);
          stateRef.current = initial;
          setStepCount(0);
          setStatus('idle');
          setLastStepLog(undefined);
          setErrorMessage(null);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error resetting simulation after config change';
          setErrorMessage(msg);
          setStatus('error');
        }
      }
    },
    [module]
  );

  const updateState = useCallback((updater: (prevState: TState) => TState) => {
    setState((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  // Playback timer effect
  useEffect(() => {
    if (status !== 'running') return;

    const timer = setTimeout(() => {
      if (module.subStep) {
        performSubStep();
      } else {
        performStep();
      }
    }, speedMs);

    return () => clearTimeout(timer);
  }, [status, stepCount, speedMs, performStep, performSubStep, module.subStep]);

  return {
    state,
    config,
    status,
    stepCount,
    speedMs,
    lastStepLog,
    errorMessage,
    hasSubStep: Boolean(module.subStep),
    play,
    pause,
    step,
    subStep,
    reset,
    setSpeedMs,
    updateConfig,
    updateState,
  };
}
