import type { JsonValue } from 'type-fest'


type Operation = 'add' | 'remove' | 'replace' | 'test'


export type JSONPatch = {
  value: JsonValue
  op: Operation
  path: `/${string}`
}
