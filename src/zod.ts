import _ from 'lodash';
import z from 'zod';

// https://github.com/dbartholomae/lambda-middleware/blob/main/packages/json-serializer/src/types/JSONObject.ts
export type JSONPrimitive = string | number | boolean | JSONObject | null | undefined;
export type JSONObject = { [key: string]: JSONPrimitive } | JSONObject[];

// https://github.com/colinhacks/zod/discussions/2215#discussioncomment-5356286
export const StringifiedJSON = z.string().transform((str, ctx): z.ZodType<JSONObject> => {
  try {
    return JSON.parse(str);
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
    return z.NEVER;
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function maskFromArray<K extends keyof any>(arr: K[]): Record<K, true> {
  return _.fromPairs(_.map(arr, (key) => [key, true])) as Record<K, true>;
}
