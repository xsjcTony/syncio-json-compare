import type { JSONPatch } from '@/types/JSONPatch'
import { describe, expect, it } from 'vitest'
import { deepRead, insertAfter, isObjectOrArrayStartBracket, makeRecursiveKeyObject, patchJSON } from '@utils/diff'


describe('deepRead', () => {
  it(`should return the original object if "pathSegments" has no element`, () => {
    const obj = { foo: 'bar' }
    const pathSegments: string[] = []

    const result = deepRead(obj, pathSegments)

    expect(result).toBe(obj)
  })


  it(`should return "undefined" if "pathSegments" is not found in the object`, () => {
    const obj = { foo: 'bar' }
    const pathSegments = ['baz']

    const result = deepRead(obj, pathSegments)

    expect(result).toBe(void 0)
  })


  it(`should return the value of the object at the path specified by "pathSegments"`, () => {
    const object = { foo: [{ bar: 'baz' }, { bar: { qux: 'zzz' } }] }
    const pathSegments = ['foo', '1', 'bar']

    const result = deepRead(object, pathSegments)

    expect(result).toBe(object.foo[1].bar)
  })
})


describe('insertAfter', () => {
  it(`should do nothing if "obj" is falsy`, () => {
    const objNull = null
    const objUndefined = void 0
    const objFalse = false

    insertAfter(objNull, 'key', 'value', 'anchorKey')
    insertAfter(objUndefined, 'key', 'value', 'anchorKey')
    insertAfter(objFalse, 'key', 'value', 'anchorKey')

    expect(objNull).toBe(null)
    expect(objUndefined).toBe(void 0)
    expect(objFalse).toBe(false)
  })


  it(`should insert the property right after the anchor key (order matters here)`, () => {
    const obj = { a: 1, b: 2 }

    insertAfter(obj, 'c', 3, 'a')

    expect(Object.keys(obj)).toStrictEqual(['a', 'c', 'b'])
  })
})


describe('makeRecursiveKeyObject', () => {
  it(`should return the original value if it's [PRIMITIVE]`, () => {
    const StrValue = 'string'
    const NumValue = 1
    const BoolValue = true
    const NullValue = null

    const resultStr = makeRecursiveKeyObject(StrValue, 'suffix')
    const resultNum = makeRecursiveKeyObject(NumValue, 'suffix')
    const resultBool = makeRecursiveKeyObject(BoolValue, 'suffix')
    const resultNull = makeRecursiveKeyObject(NullValue, 'suffix')

    expect(resultStr).toBe(StrValue)
    expect(resultNum).toBe(NumValue)
    expect(resultBool).toBe(BoolValue)
    expect(resultNull).toBe(NullValue)
  })


  it(`should return the original value if it's an [ARRAY]`, () => {
    const arr = [1, 2, 3]

    const result = makeRecursiveKeyObject(arr, 'suffix')

    expect(result).toBe(arr)
  })


  it(`should return an object with keys suffixed with "keySuffix" if the value is an [OBJECT]`, () => {
    const obj = { a: 1, b: 2 }
    const suffix = '__weird__suffix'

    const result = makeRecursiveKeyObject(obj, suffix)

    expect(result).toStrictEqual({
      a__weird__suffix: 1,
      b__weird__suffix: 2,
    })
  })


  it(`should recursively suffix keys of nested objects`, () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    }
    const suffix = '__weird__suffix'

    const result = makeRecursiveKeyObject(obj, suffix)

    expect(result).toStrictEqual({
      a__weird__suffix: 1,
      b__weird__suffix: {
        c__weird__suffix: 2,
        d__weird__suffix: {
          e__weird__suffix: 3,
        },
      },
    })
  })


  it(`should also ignore [PRIMITIVE]s and [ARRAY]s in nested objects`, () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
      f: 'string',
      g: [1, 2, 3],
    }
    const suffix = '__weird__suffix'

    const result = makeRecursiveKeyObject(obj, suffix)

    expect(result).toStrictEqual({
      a__weird__suffix: 1,
      b__weird__suffix: {
        c__weird__suffix: 2,
        d__weird__suffix: {
          e__weird__suffix: 3,
        },
      },
      f__weird__suffix: 'string',
      g__weird__suffix: [1, 2, 3],
    })
  })
})


describe('isObjectOrArrayStartBracket', () => {
  it(`should return "true" if the string is an [OBJECT] or [ARRAY]'s start bracket`, () => {
    const objStart = ' {'
    const arrStart = ' ['

    const resultObj = isObjectOrArrayStartBracket(objStart)
    const resultArr = isObjectOrArrayStartBracket(arrStart)

    expect(resultObj).toBe(true)
    expect(resultArr).toBe(true)
  })


  it(`should return "false" if the starting bracket has no indentation`, () => {
    const objStart = '{'
    const arrStart = '['

    const resultObj = isObjectOrArrayStartBracket(objStart)
    const resultArr = isObjectOrArrayStartBracket(arrStart)

    expect(resultObj).toBe(false)
    expect(resultArr).toBe(false)
  })


  it(`should return "false" if the string is not an [OBJECT] or [ARRAY]'s start bracket`, () => {
    const objStart = 'abc'
    const arrStart = 'def'

    const resultObj = isObjectOrArrayStartBracket(objStart)
    const resultArr = isObjectOrArrayStartBracket(arrStart)

    expect(resultObj).toBe(false)
    expect(resultArr).toBe(false)
  })
})


describe(`patchJSON`, () => {
  it(`should insert "replace" operation values right after it's key with "__patched__replace" suffix`, () => {
    const initialJSON = { foo: { bar: 'baz', qux: 'zzz' } }
    const patches: JSONPatch[] = [{ value: 'addedValue', op: 'replace', path: '/foo/bar' }]

    const patchedJSON = patchJSON(initialJSON, patches)

    expect(patchedJSON).toStrictEqual({
      foo: {
        bar: 'baz',
        bar__patched__replace: 'addedValue',
        qux: 'zzz',
      },
    })
  })


  it(`should insert "add" operation values right after it's key with "__patched__add" suffix, recursively`, () => {
    const initialJSON = { foo: { bar: 'baz', qux: 'zzz' } }
    const patches: JSONPatch[] = [{ value: { addedKey: 'addedValue' }, op: 'add', path: '/foo/foo' }]

    const patchedJSON = patchJSON(initialJSON, patches)

    expect(patchedJSON).toStrictEqual({
      foo: {
        bar: 'baz',
        qux: 'zzz',
        foo__patched__add: {
          addedKey__patched__add: 'addedValue',
        },
      },
    })
  })


  it(`should insert "remove" operation values right after it's key with "__patched__remove" suffix, and remove the original keys`, () => {
    const initialJSON = { foo: { bar: 'baz', qux: 'zzz' } }
    const patches: JSONPatch[] = [{ op: 'remove', path: '/foo/bar' }]

    const patchedJSON = patchJSON(initialJSON, patches)

    expect(patchedJSON).toStrictEqual({
      foo: {
        qux: 'zzz',
        bar__patched__remove: 'baz',
      },
    })
  })


  it(`should do nothing if the operation is not "replace", "add", or "remove"`, () => {
    const initialJSON = { foo: { bar: 'baz', qux: 'zzz' } }
    const patches: JSONPatch[] = [{ value: 'whatever', op: 'test', path: '/foo/bar' }]

    const patchedJSON = patchJSON(initialJSON, patches)

    expect(patchedJSON).toStrictEqual(initialJSON)
  })
})
