// helpers/accessEnv.ts
export function accessEnv(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
      throw new Error(`Environment variable ${key} not found.`);
    }
    return value || defaultValue;
  }
  