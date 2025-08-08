export type ValueOf<T> = T[keyof T];

export type FilterKeys<T, V> = ValueOf<{
  [K in keyof T]: T[K] extends V ? never : K;
}>;

export type OmitValues<T, V> = {
  [K in FilterKeys<T, V>]: T[K];
};

export type OmitNever<T> = OmitValues<T, never>;

type RemovePrefix<Str extends string, Prefix extends string> = Str extends `${Prefix}${infer Suffix}`
  ? Suffix
  : never;

type Join<Str extends string[], Chr extends string, first = true> = Str extends [
  infer Head extends string,
  ...infer Tail extends string[],
]
  ? `${first extends true ? '' : '.'}${Head}${Join<Tail, Chr, false>}`
  : '';

type Paths<T, P extends PropertyKey[] = []> = T extends object
  ? ValueOf<{
      [K in keyof T]: Paths<T[K], [...P, K]>;
    }>
  : P;

type InnerPaths<T, P extends PropertyKey[] = []> = T extends object
  ?
      | (P extends [] ? never : P)
      | ValueOf<{
          [K in keyof T]: InnerPaths<T[K], [...P, K]>;
        }>
  : P;

type RemoveLeaves<T> = {
  [K in keyof T as T[K] extends object ? K : never]: RemoveLeaves<T[K]>;
};

export type Prefix<T> = Join<InnerPaths<RemoveLeaves<T>>, '.'>;

export type Suffix<T, P extends Prefix<T> | null> = P extends null
  ? Join<Extract<Paths<T>, string[]>, '.'>
  : RemovePrefix<Extract<Join<Extract<Paths<T>, string[]>, '.'>, string>, `${Exclude<P, void>}.`>;
