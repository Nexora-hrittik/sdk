import React from 'react';

export type SimulationDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type SimulationLifecycleStatus =
  | 'available'
  | 'beta'
  | 'experimental'
  | 'coming-soon';

export interface SimulationMetadata {
  id: string;
  title: string;
  shortDescription: string;
  description?: string;
  topicId: string;
  topics?: string[];
  category: string;
  concepts?: string[];
  tags: string[];
  difficulty: SimulationDifficulty;
  status?: SimulationLifecycleStatus;
  featured?: boolean;
  estimatedTime?: string;
  prerequisites?: string[];
  version: string;
  sdkVersion?: string;
  author?: {
    name: string;
    github?: string;
  };
}

export interface EducationalReference {
  title: string;
  url: string;
  description?: string;
}

export interface SimulationContent {
  introduction: string;
  theory: string;
  howItWorks: string[];
  keyFormulas?: Array<{ label: string; formula: string; explanation: string }>;
  guidedInquiries?: Array<{ question: string; answer: string; note?: string }>;
  references: EducationalReference[];
}

export interface StepResult<TState, TStepLog = unknown> {
  nextState: TState;
  isComplete: boolean;
  stepLog?: TStepLog;
}

export interface SimulationCompletion {
  title: string;
  description: string;
  analysis?: {
    title: string;
    explanation: string;
    inquiry?: string;
  };
}

export interface SimulationVisualizationProps<TState, TConfig, TStepLog = unknown> {
  state: TState;
  config: TConfig;
  isRunning: boolean;
  stepCount: number;
  lastStepLog?: TStepLog;
  speedMs: number;
  onUpdateState: (updater: (prevState: TState) => TState) => void;
  onAction?: (actionName: string, payload?: unknown) => void;
}

export interface SimulationControlsProps<TState, TConfig> {
  config: TConfig;
  state: TState;
  onChangeConfig: (newConfig: Partial<TConfig>) => void;
  onUpdateState?: (updater: (prevState: TState) => TState) => void;
  disabled: boolean;
}

export interface SimulationInspectorProps<TState, TConfig, TStepLog = unknown> {
  state: TState;
  config: TConfig;
  lastStepLog?: TStepLog;
}

export interface SimulationModule<TState, TConfig, TStepLog = unknown> {
  metadata: SimulationMetadata;
  content: SimulationContent;
  defaultConfig: TConfig;
  createInitialState: (config: TConfig) => TState;
  step: (state: TState, config: TConfig) => StepResult<TState, TStepLog>;
  subStep?: (state: TState, config: TConfig) => StepResult<TState, TStepLog>;
  reset?: (config: TConfig) => TState;
  completionSummary?: (state: TState, config: TConfig) => SimulationCompletion;
  Visualization: React.FC<SimulationVisualizationProps<TState, TConfig, TStepLog>>;
  Controls: React.FC<SimulationControlsProps<TState, TConfig>>;
  StateInspector?: React.FC<SimulationInspectorProps<TState, TConfig, TStepLog>>;
}

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';
