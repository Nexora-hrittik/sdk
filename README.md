# @nexora/sdk

Official Simulation SDK for the **Nexora** platform.

This package defines the core runtime interfaces, pure state transition contracts, execution hooks, and telemetry UI components used to build interactive, deterministic computer science simulations.

---

## Architecture & Dependency Rule

```
                  ┌────────────────────┐
                  │    @nexora/sdk     │
                  └─────────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         Perceptron      Counter     Binary Search
              │             │             │
              └─────────────┼─────────────┘
                            │
                            ▼
                    Nexora Platform
```

The SDK is a foundational, standalone package:
- It has **zero dependencies on the Nexora platform**.
- It exports strongly typed contracts that all simulations must satisfy.
- It provides headless runtime execution hooks (`useSimulationRuntime`) and reusable telemetry playback controls (`PlaybackBar`, `Slider`, `ErrorFallback`).

---

## Installation

```bash
npm install @nexora/sdk
```

Peer dependencies:
- `react` >= 19.0.0
- `react-dom` >= 19.0.0
- `lucide-react` >= 1.0.0

---

## Core Contract

Every simulation module exported for Nexora implements `SimulationModule<TState, TConfig, TStepLog>`:

```typescript
import { SimulationModule } from '@nexora/sdk';

export interface MyState { ... }
export interface MyConfig { ... }

export const mySimulation: SimulationModule<MyState, MyConfig> = {
  metadata: {
    id: 'my-simulation',
    title: 'My Simulation',
    shortDescription: '...',
    topicId: 'algorithms',
    category: 'Algorithms',
    tags: ['sorting'],
    difficulty: 'Beginner',
    version: '1.0.0',
    sdkVersion: '0.1.0',
  },
  content: {
    introduction: '...',
    theory: '...',
    howItWorks: ['...'],
    references: [],
  },
  defaultConfig: { ... },
  createInitialState: (config) => ({ ... }),
  step: (state, config) => ({
    nextState: { ... },
    isComplete: false,
  }),
  Visualization: MyVisualization,
  Controls: MyControls,
};
```

---

## Building and Testing

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Build ES & CommonJS libraries + TypeScript declaration types
npm run build

# Validate package distribution payload
npm pack --dry-run
```
