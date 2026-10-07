import { describe, it, expect } from 'vitest';
import * as SDK from '../index';
import { SimulationModule, StepResult } from '../types';

describe('SDK Public Boundary & Contract Verification', () => {
  it('exports all expected public interfaces and runtime utilities', () => {
    expect(SDK.useSimulationRuntime).toBeDefined();
    expect(SDK.PlaybackBar).toBeDefined();
    expect(SDK.ErrorFallback).toBeDefined();
    expect(SDK.SimulationPreviewHarness).toBeDefined();
    expect(SDK.validateSimulationModule).toBeDefined();
    expect(SDK.checkSDKCompatibility).toBeDefined();
    expect(SDK.SDK_VERSION).toBe('0.1.0');
  });

  it('executes a minimal simulation module through standard step and subStep contract', () => {
    interface TestState {
      count: number;
      phase: 'odd' | 'even';
    }
    interface TestConfig {
      limit: number;
    }

    const testModule: SimulationModule<TestState, TestConfig, string> = {
      metadata: {
        id: 'test-counter',
        title: 'Test Counter',
        shortDescription: 'Contract validation test module',
        topicId: 'testing',
        category: 'SDK Tests',
        tags: ['test'],
        difficulty: 'Beginner',
        version: '1.0.0',
        sdkVersion: SDK.SDK_VERSION,
      },
      content: {
        introduction: 'Intro',
        theory: 'Theory',
        howItWorks: ['Step 1'],
        references: [],
      },
      defaultConfig: { limit: 5 },
      createInitialState: () => ({ count: 0, phase: 'even' }),
      step: (state: TestState, config: TestConfig): StepResult<TestState, string> => {
        const nextCount = state.count + 1;
        return {
          nextState: { count: nextCount, phase: nextCount % 2 === 0 ? 'even' : 'odd' },
          isComplete: nextCount >= config.limit,
          stepLog: `Advanced to ${nextCount}`,
        };
      },
      subStep: (state: TestState, config: TestConfig): StepResult<TestState, string> => {
        if (state.phase === 'even') {
          return {
            nextState: { ...state, phase: 'odd' },
            isComplete: false,
            stepLog: 'Phase shifted to odd',
          };
        }
        const nextCount = state.count + 1;
        return {
          nextState: { count: nextCount, phase: 'even' },
          isComplete: nextCount >= config.limit,
          stepLog: `Count incremented to ${nextCount}`,
        };
      },
      reset: () => ({ count: 0, phase: 'even' }),
      completionSummary: (state: TestState) => ({
        title: 'Test Complete',
        description: `Reached ${state.count}`,
      }),
      Visualization: () => null,
      Controls: () => null,
    };

    // 1. Initial State
    let state = testModule.createInitialState(testModule.defaultConfig);
    expect(state.count).toBe(0);
    expect(state.phase).toBe('even');

    // 2. subStep execution
    const subResult1 = testModule.subStep!(state, testModule.defaultConfig);
    expect(subResult1.nextState.phase).toBe('odd');
    expect(subResult1.nextState.count).toBe(0);

    const subResult2 = testModule.subStep!(subResult1.nextState, testModule.defaultConfig);
    expect(subResult2.nextState.phase).toBe('even');
    expect(subResult2.nextState.count).toBe(1);

    // 3. Step execution to completion
    state = subResult2.nextState;
    while (!state.count || state.count < testModule.defaultConfig.limit) {
      const stepRes = testModule.step(state, testModule.defaultConfig);
      state = stepRes.nextState;
      if (stepRes.isComplete) break;
    }
    expect(state.count).toBe(5);

    // 4. Completion Summary
    const summary = testModule.completionSummary!(state, testModule.defaultConfig);
    expect(summary.title).toBe('Test Complete');

    // 5. Reset
    const resetState = testModule.reset!(testModule.defaultConfig);
    expect(resetState.count).toBe(0);
  });
});
