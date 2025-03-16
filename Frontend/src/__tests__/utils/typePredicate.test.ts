import { describe, expect, it } from 'vitest'
import { isJSONObjectOrArray } from '@utils/typePredicate.ts'


describe('isJSONObjectOrArray', () => {
  it(`should return "false" for any valid JSON value other than "array" or "object"`, () => {
    const strValue = 'string'
    const numValue = 123
    const nullValue = null


    expect(isJSONObjectOrArray(strValue)).toBe(false)
    expect(isJSONObjectOrArray(numValue)).toBe(false)
    expect(isJSONObjectOrArray(nullValue)).toBe(false)
  })


  it(`should return "true" for an object`, () => {
    const obj = { foo: 'bar' }

    expect(isJSONObjectOrArray(obj)).toBe(true)
  })


  it(`should return "true" for an array`, () => {
    const arr = ['foo', 'bar']

    expect(isJSONObjectOrArray(arr)).toBe(true)
  })
})
