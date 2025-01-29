export type PartialSome<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
