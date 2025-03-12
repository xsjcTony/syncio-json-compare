import type { JsonArray, JsonObject, JsonValue } from 'type-fest'


export function isJSONObjectOrArray(value: JsonValue): value is JsonArray | JsonObject {
  return (value && typeof value === 'object')
    || Array.isArray(value)
}
