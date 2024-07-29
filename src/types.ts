import AsyncLock from "async-lock";

// https://stackoverflow.com/questions/34098023
// type EntityConstructor<T> = new (...args: any[]) => T;
type EntityConstructor<MODEL, CONTEXT, ENTITY> = {
  new (
    model: MODEL,
    context: CONTEXT,
    group: ENTITY[],
    lock: AsyncLock
  ): ENTITY;
};

type LoadKey = Record<string, any>;

type LoadConfig<ENTITY, LOADED> = {
  name: string;
  filter: (one: ENTITY) => boolean;
  getter?: (sources: ENTITY[]) => LoadKey[];
  loader?: (keys: LoadKey[]) => Promise<LOADED[]>;
  setter?: (sources: ENTITY[], targets: LOADED[]) => void;
};

// Note: it selects field when you set the field key to either true or false.
type Select<RESPONSE, FIELD_REQUEST> = FIELD_REQUEST extends Record<string, any>
  ? /* select fields */ {
      [KEY in keyof FIELD_REQUEST as FIELD_REQUEST[KEY] extends
        | boolean
        | Record<string, any>
        ? KEY
        : never]: KEY extends keyof RESPONSE
        ? /* valid type key */ FIELD_REQUEST[KEY] extends Record<string, any>
          ? /* nest-select inner type */ RESPONSE[KEY] extends
              | Array<infer INNER>
              | undefined
            ? /* type is array */ INNER extends Record<string, any>
              ? /* inner type is object */ Array<
                  Select<INNER, FIELD_REQUEST[KEY]>
                >
              : /* inner type is primitive */ never
            : /* type is single */ null extends RESPONSE[KEY]
            ? /* type is nullable */ RESPONSE[KEY] extends
                | Record<string, any>
                | null
                | undefined
              ? /* type is object */ Select<
                  NonNullable<RESPONSE[KEY]>,
                  FIELD_REQUEST[KEY]
                > | null
              : /* type is primitive */ never
            : /* type is non-nullable */ RESPONSE[KEY] extends
                | Record<string, any>
                | undefined
            ? /* type is object */ Select<
                NonNullable<RESPONSE[KEY]>,
                FIELD_REQUEST[KEY]
              >
            : /* type is primitive */ never
          : /* otherwise */ FIELD_REQUEST[KEY] extends boolean
          ? /* gross-select field */ Exclude<RESPONSE[KEY], undefined>
          : /* invalid selection */ never
        : /* invalid type key */ never;
    }
  : /* otherwise */ FIELD_REQUEST extends boolean
  ? /* original response */ RESPONSE
  : /* invalid selection */ never;

export { AsyncLock, EntityConstructor, LoadConfig, LoadKey, Select };
