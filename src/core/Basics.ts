import * as Utils from './Utils';
import * as Debug from './Debug';

export type ComparsionOperator = -1 | 0 | 1;
export const LT = -1;
export const EQ = 0;
export const GT = 1;

export interface ElmCustomType {
  $: any | null | undefined;
  a?: any | null | undefined;
  b?: any | null | undefined;
}

export function logBase(base: number, number: number): number {
  return Math.log(number) / Math.log(base);
}

export function max(x, y): boolean {
    return (Utils.cmp(x, y) > 0) ? x : y;
}
