export * from './types';
export * from './zod';

export function capitalize(str: string, locale = navigator.language): string {
  return str.replace(/^\p{CWU}/u, (char) => char.toLocaleUpperCase(locale));
}

export const objectFromKeys = <K extends string, V>(keys: readonly K[], value: (key: K) => V): { [key in K]: V } =>
  keys.reduce((acc, key) => ({ ...acc, [key]: value(key) }), {}) as { [key in K]: V };

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
