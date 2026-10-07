export const SDK_VERSION = '0.1.0';

export type CompatibilityStatus = 'compatible' | 'incompatible' | 'unknown';

export interface CompatibilityResult {
  status: CompatibilityStatus;
  message: string;
  sdkVersion: string;
  requiredVersion?: string;
}

/**
 * Checks semantic version compatibility between a simulation's declared
 * required SDK version and the currently running SDK runtime version.
 */
export function checkSDKCompatibility(
  requiredVersion?: string,
  currentSdkVersion: string = SDK_VERSION
): CompatibilityResult {
  if (!requiredVersion) {
    return {
      status: 'unknown',
      message: 'No SDK version specified in module metadata.',
      sdkVersion: currentSdkVersion,
    };
  }

  const parseSemver = (v: string) => {
    const clean = v.replace(/^[^0-9]*/, '');
    const parts = clean.split('.').map((p) => parseInt(p, 10));
    return {
      major: isNaN(parts[0]) ? 0 : parts[0],
      minor: isNaN(parts[1]) ? 0 : parts[1],
      patch: isNaN(parts[2]) ? 0 : parts[2],
    };
  };

  const current = parseSemver(currentSdkVersion);
  const required = parseSemver(requiredVersion);

  // Semver rule: for pre-1.0 (0.x), breaking changes occur on minor version increments.
  // For >= 1.0, breaking changes occur on major version increments.
  const isCompatible =
    current.major === 0 && required.major === 0
      ? current.minor === required.minor
      : current.major === required.major && current.minor >= required.minor;

  if (isCompatible) {
    return {
      status: 'compatible',
      message: `SDK version ${currentSdkVersion} is compatible with requested version ${requiredVersion}.`,
      sdkVersion: currentSdkVersion,
      requiredVersion,
    };
  }

  return {
    status: 'incompatible',
    message: `SDK version mismatch: simulation requires ${requiredVersion}, but runtime provides ${currentSdkVersion}.`,
    sdkVersion: currentSdkVersion,
    requiredVersion,
  };
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

/**
 * Validates a simulation module object against the required SDK contract.
 * Checks metadata completeness, educational content, and executable function hooks.
 */
export function validateSimulationModule(module: unknown): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!module || typeof module !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Simulation module must be a non-null object.' }],
      warnings: [],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = module as Record<string, any>;

  // 1. Metadata Validation
  if (!mod.metadata || typeof mod.metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Missing metadata object.' });
  } else {
    const meta = mod.metadata;
    if (!meta.id || typeof meta.id !== 'string') {
      errors.push({ field: 'metadata.id', message: 'Simulation metadata.id must be a non-empty string.' });
    }
    if (!meta.title || typeof meta.title !== 'string') {
      errors.push({ field: 'metadata.title', message: 'Simulation metadata.title must be a non-empty string.' });
    }
    if (!meta.shortDescription || typeof meta.shortDescription !== 'string') {
      errors.push({ field: 'metadata.shortDescription', message: 'Simulation metadata.shortDescription must be a non-empty string.' });
    }
    if (!meta.topicId || typeof meta.topicId !== 'string') {
      errors.push({ field: 'metadata.topicId', message: 'Simulation metadata.topicId must be a non-empty string.' });
    }
    if (!meta.difficulty || !['Beginner', 'Intermediate', 'Advanced'].includes(meta.difficulty)) {
      errors.push({ field: 'metadata.difficulty', message: 'Simulation metadata.difficulty must be Beginner, Intermediate, or Advanced.' });
    }
    if (!meta.version || typeof meta.version !== 'string') {
      errors.push({ field: 'metadata.version', message: 'Simulation metadata.version must be specified.' });
    }
    if (!meta.sdkVersion) {
      warnings.push({ field: 'metadata.sdkVersion', message: 'Simulation metadata does not specify sdkVersion.' });
    }
  }

  // 2. Educational Content Validation
  if (!mod.content || typeof mod.content !== 'object') {
    errors.push({ field: 'content', message: 'Missing content object.' });
  } else {
    const c = mod.content;
    if (!c.introduction || typeof c.introduction !== 'string') {
      errors.push({ field: 'content.introduction', message: 'Missing or invalid introduction text.' });
    }
    if (!c.theory || typeof c.theory !== 'string') {
      errors.push({ field: 'content.theory', message: 'Missing or invalid theory text.' });
    }
    if (!Array.isArray(c.howItWorks) || c.howItWorks.length === 0) {
      errors.push({ field: 'content.howItWorks', message: 'howItWorks must be a non-empty array of strings.' });
    }
  }

  // 3. Functions Validation
  if (typeof mod.createInitialState !== 'function') {
    errors.push({ field: 'createInitialState', message: 'createInitialState must be an executable function.' });
  }
  if (typeof mod.step !== 'function') {
    errors.push({ field: 'step', message: 'step must be an executable function.' });
  }
  if (mod.subStep !== undefined && typeof mod.subStep !== 'function') {
    errors.push({ field: 'subStep', message: 'subStep, if provided, must be a function.' });
  }
  if (mod.reset !== undefined && typeof mod.reset !== 'function') {
    errors.push({ field: 'reset', message: 'reset, if provided, must be a function.' });
  }
  if (mod.defaultConfig === undefined) {
    errors.push({ field: 'defaultConfig', message: 'defaultConfig must be defined.' });
  }

  // 4. UI Components Validation
  if (typeof mod.Visualization !== 'function') {
    errors.push({ field: 'Visualization', message: 'Visualization must be a React component function.' });
  }
  if (typeof mod.Controls !== 'function') {
    errors.push({ field: 'Controls', message: 'Controls must be a React component function.' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
