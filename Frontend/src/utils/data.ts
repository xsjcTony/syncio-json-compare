import firstPayload from '@data/payload-1.json'
import secondPayload from '@data/payload-2.json'


export function loadFirstPayload(): string {
  return JSON.stringify(firstPayload)
}


export function loadSecondPayload(): string {
  return JSON.stringify(secondPayload)
}
