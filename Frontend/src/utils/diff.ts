import type { JSONPatch } from '@/types/JSONPatch'
import type { JsonValue } from 'type-fest'
import { transformerNotationDiff } from '@shikijs/transformers'
import { codeToHtml } from 'shiki'
import { JSON_FORMAT_INDENT } from '@/constants'
import { SHIKI_TRANSFORMER_COMMENT_ADD, SHIKI_TRANSFORMER_COMMENT_REMOVE } from '@constants/code'
import {
  ARRAY_ENDING_BRACKET_REGEX,
  ARRAY_OPENING_BRACKET_REGEX,
  OBJECT_ENDING_BRACKET_REGEX,
  OBJECT_OPENING_BRACKET_REGEX,
} from '@constants/regex'


export function deepRead(obj: object, pathSegments: string[]): any {
  return pathSegments.reduce((acc: any, pathSegment) => acc?.[pathSegment], obj)
}

export function insertAfter(obj: any, key: string, value: JsonValue, anchorKey: string): void {
  if (!obj?.[anchorKey])
    return

  const keys = Object.keys(obj)
  const values = Object.values(obj)
  const afterKeyIndex = keys.indexOf(anchorKey)
  const keysToDelete = keys.toSpliced(0, afterKeyIndex + 1)

  for (const key of keysToDelete)
    delete obj[key]

  obj[key] = value

  for (const [index, key] of keys.entries()) {
    if (index <= afterKeyIndex)
      continue

    obj[key] = values[index]
  }
}


export function makeRecursiveKeyObject(value: JsonValue, keySuffix: string): any {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).reduce<any>((acc, [key, value]) => {
      acc[`${key}${keySuffix}`] = makeRecursiveKeyObject(value, keySuffix)
      return acc
    }, {})
  }

  return value
}

export function isObjectOrArrayStartBracket(str: string): boolean {
  return OBJECT_OPENING_BRACKET_REGEX.test(str) || ARRAY_OPENING_BRACKET_REGEX.test(str)
}

export function isObjectOrArrayEndBracket(str: string): boolean {
  return OBJECT_ENDING_BRACKET_REGEX.test(str) || ARRAY_ENDING_BRACKET_REGEX.test(str)
}


export function patchJSON(initialJSON: object, patches: JSONPatch[]): object {
  const patchesGroupedByPath = Object.groupBy(patches, ({ path }) => path)

  const patchedJSON = initialJSON

  for (const [path, operations] of Object.entries(patchesGroupedByPath)) {
    if (!operations || operations.length === 0)
      continue

    const pathSegments = path.split('/').filter(Boolean)
    const lastSegment = pathSegments.pop()

    if (!lastSegment)
      continue

    const obj = deepRead(patchedJSON, pathSegments)

    for (const operation of operations) {
      switch (operation.op) {
        case 'replace': {
          insertAfter(obj, `${lastSegment}__patched__replace`, operation.value, lastSegment)
          break
        }
        case 'add': {
          const key = Array.isArray(obj) ? lastSegment : `${lastSegment}__patched__add`
          obj[key] = makeRecursiveKeyObject(operation.value, '__patched__add')
          break
        }
        case 'remove': {
          const value = structuredClone(obj[lastSegment])
          const key = Array.isArray(obj) ? lastSegment : `${lastSegment}__patched__remove`
          delete obj[lastSegment]
          obj[key] = makeRecursiveKeyObject(value, '__patched__remove')
          break
        }
        default: {
          break
        }
      }
    }
  }

  return patchedJSON
}


export async function highlightJSONDiff(initialJSON: object, patches: JSONPatch[]): Promise<string> {
  const patchedJSON = patchJSON(initialJSON, patches)

  const formattedJSON = JSON.stringify(patchedJSON, null, JSON_FORMAT_INDENT)
  const fragments = formattedJSON.split('\n')


  // deal with patches
  for (const [index, fragment] of fragments.entries()) {
    // op: replace
    if (fragment.includes('__patched__replace')) {
      fragments[index - 1] = fragments[index - 1] + SHIKI_TRANSFORMER_COMMENT_REMOVE
      fragments[index] = fragment.replace('__patched__replace', '') + SHIKI_TRANSFORMER_COMMENT_ADD
      continue
    }

    // op: add
    if (fragment.includes('__patched__add')) {
      fragments[index] = fragments[index].replace('__patched__add', '') + SHIKI_TRANSFORMER_COMMENT_ADD

      if (isObjectOrArrayStartBracket(fragments[index - 1]))
        fragments[index - 1] = fragments[index - 1] + SHIKI_TRANSFORMER_COMMENT_ADD

      if (isObjectOrArrayEndBracket(fragments[index + 1]))
        fragments[index + 1] = fragments[index + 1] + SHIKI_TRANSFORMER_COMMENT_ADD

      continue
    }

    // op: remove
    if (fragment.includes('__patched__remove')) {
      fragments[index] = fragments[index].replace('__patched__remove', '') + SHIKI_TRANSFORMER_COMMENT_REMOVE

      if (isObjectOrArrayStartBracket(fragments[index - 1]))
        fragments[index - 1] = fragments[index - 1] + SHIKI_TRANSFORMER_COMMENT_REMOVE

      if (isObjectOrArrayEndBracket(fragments[index + 1]))
        fragments[index + 1] = fragments[index + 1] + SHIKI_TRANSFORMER_COMMENT_REMOVE
    }
  }


  return await codeToHtml(fragments.join('\n'), {
    lang: 'json',
    theme: 'vitesse-dark',
    transformers: [transformerNotationDiff()],
  })
}
