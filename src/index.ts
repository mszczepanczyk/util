export * from './zod';

export function capitalize(str: string, locale = navigator.language): string {
  return str.replace(/^\p{CWU}/u, (char) => char.toLocaleUpperCase(locale));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
