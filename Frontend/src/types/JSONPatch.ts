import type { JsonValue } from 'type-fest'


type Operation = 'add' | 'remove' | 'replace' | 'test'


export type JSONPatch = {
  op: 'remove'
  path: `/${string}`
} | {
  value: JsonValue
  op: Exclude<Operation, 'remove'>
  path: `/${string}`
}
