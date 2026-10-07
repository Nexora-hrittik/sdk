import { describe, it, expect } from 'vitest';
import {
  validateSimulationModule,
  checkSDKCompatibility,
} from './index';

describe('SDK Validation & Compatibility', () => {
  const minimalValidModule = {
    metadata: {
      id: 'valid-test-module',
      title: 'Valid Module',
      shortDescription: 'A valid module for testing.',
      topicId: 'testing',
      category: 'Unit Tests',
      tags: ['test'],
      difficulty: 'Beginner' as const,
      version: '1.0.0',
      sdkVersion: '0.1.0',
    },
    content: {
      introduction: 'Intro text',
      theory: 'Theory text',
      howItWorks: ['Step 1', 'Step 2'],
      references: [],
    },
    defaultConfig: { speed: 1 },
    createInitialState: () => ({ value: 0 }),
    step: (state: { value: number }) => ({ nextState: { value: state.value + 1 }, isComplete: false }),
    Visualization: () => null,
    Controls: () => null,
  };

  it('passes validation for a fully conformant simulation module', () => {
    const res = validateSimulationModule(minimalValidModule);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('fails validation when root object is null or missing', () => {
    const res = validateSimulationModule(null);
    expect(res.valid).toBe(false);
    expect(res.errors[0].field).toBe('root');
  });

  it('fails validation when mandatory metadata fields are missing', () => {
    const brokenModule = {
      ...minimalValidModule,
      metadata: {
        title: 'Missing ID',
      },
    };
    const res = validateSimulationModule(brokenModule);
    expect(res.valid).toBe(false);
    const fields = res.errors.map((e) => e.field);
    expect(fields).toContain('metadata.id');
    expect(fields).toContain('metadata.shortDescription');
    expect(fields).toContain('metadata.topicId');
  });

  it('fails validation when executable simulation functions are missing', () => {
    const brokenModule = {
      ...minimalValidModule,
      createInitialState: undefined,
      step: 'not-a-function',
    };
    const res = validateSimulationModule(brokenModule);
    expect(res.valid).toBe(false);
    const fields = res.errors.map((e) => e.field);
    expect(fields).toContain('createInitialState');
    expect(fields).toContain('step');
  });

  it('warns when sdkVersion is omitted from metadata', () => {
    const noSdkVerModule = {
      ...minimalValidModule,
      metadata: {
        ...minimalValidModule.metadata,
        sdkVersion: undefined,
      },
    };
    const res = validateSimulationModule(noSdkVerModule);
    expect(res.valid).toBe(true);
    expect(res.warnings.some((w) => w.field === 'metadata.sdkVersion')).toBe(true);
  });

  describe('checkSDKCompatibility', () => {
    it('returns unknown when no required version is provided', () => {
      const res = checkSDKCompatibility(undefined, '0.1.0');
      expect(res.status).toBe('unknown');
    });

    it('returns compatible when version matches current 0.x minor version', () => {
      const res = checkSDKCompatibility('0.1.0', '0.1.0');
      expect(res.status).toBe('compatible');
    });

    it('returns incompatible when 0.x minor version differs', () => {
      const res = checkSDKCompatibility('0.2.0', '0.1.0');
      expect(res.status).toBe('incompatible');
    });

    it('returns compatible for >= 1.0 when major matches and minor is <= runtime', () => {
      const res = checkSDKCompatibility('1.1.0', '1.3.0');
      expect(res.status).toBe('compatible');
    });

    it('returns incompatible for >= 1.0 when major differs', () => {
      const res = checkSDKCompatibility('2.0.0', '1.0.0');
      expect(res.status).toBe('incompatible');
    });
  });
});
