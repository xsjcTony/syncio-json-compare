function makeAPIUrl(pathname: string): string {
  return new URL(`/api${pathname}`, import.meta.env.SYNCIO_BACKEND_BASE_URL).href
}


export const STORE_PAYLOAD_API = makeAPIUrl(import.meta.env.SYNCIO_API_STORE_PAYLOAD)

export const COMPARE_PAYLOADS_API = makeAPIUrl(import.meta.env.SYNCIO_API_COMPARE_PAYLOADS)
