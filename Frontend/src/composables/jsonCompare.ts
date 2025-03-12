import type { StorePayloadPayload } from '@/types/payload'
import type { UseFetchOptions } from '@vueuse/core'
import { useCountdown, useFetch } from '@vueuse/core'
import { computed, ref } from 'vue'
import { COMPARE_PAYLOADS_API, STORE_PAYLOAD_API } from '@constants/api'
import { loadFirstPayload, loadSecondPayload } from '@utils/data'
import { highlightJSONDiff } from '@utils/diff'


const FIRST_PAYLOAD = loadFirstPayload()
const SECOND_PAYLOAD = loadSecondPayload()


const STORE_FIRST_PAYLOAD_PAYLOAD: StorePayloadPayload = {
  payload_no: 1,
  json_content: FIRST_PAYLOAD,
}

const STORE_SECOND_PAYLOAD_PAYLOAD: StorePayloadPayload = {
  payload_no: 2,
  json_content: SECOND_PAYLOAD,
}


export function useJsonCompare(secondPayloadDelay: Parameters<typeof useCountdown>[0]) {

  // states
  const isFirstPayloadSent = ref<boolean>(false)
  const isSecondPayloadSent = ref<boolean>(false)

  const diffResult = ref<string | null>(null)
  const error = ref<string | null>(null)


  // utils / hooks
  const clearError = (): void => {
    error.value = null
  }

  const storePayloadErrorHandler: UseFetchOptions['onFetchError'] = (ctx) => {
    resetApp()

    error.value = typeof ctx.data?.message === 'string'
      ? ctx.data.message
      : 'An error occurred when attempting to send payload. Please try again.'

    return ctx
  }

  const {
    isActive: isWaitingForSecondPayload,
    remaining: remainingSecondPayloadDelay,
    start: startSecondPayloadCountdown,
    reset: resetSecondPayloadCountdown,
  } = useCountdown(secondPayloadDelay, {
    immediate: false,
    onComplete: () => {
      void sendSecondPayload()
    },
  })

  const {
    execute: sendFirstPayload,
    isFetching: isSendingFirstPayload,
  } = useFetch(
    STORE_PAYLOAD_API,
    {
      immediate: false,
      beforeFetch: clearError,
      afterFetch: (ctx) => {
        isFirstPayloadSent.value = true
        startSecondPayloadCountdown()

        return ctx
      },
      onFetchError: storePayloadErrorHandler,
    },
  )
    .post(STORE_FIRST_PAYLOAD_PAYLOAD)
    .json()

  const {
    execute: sendSecondPayload,
    isFetching: isSendingSecondPayload,
  } = useFetch(
    STORE_PAYLOAD_API,
    {
      immediate: false,
      afterFetch: (ctx) => {
        isSecondPayloadSent.value = true
        void comparePayloads()

        return ctx
      },
      onFetchError: storePayloadErrorHandler,
    },
  )
    .post(STORE_SECOND_PAYLOAD_PAYLOAD)
    .json()

  const {
    execute: comparePayloads,
    isFetching: isComparingPayloads,
  } = useFetch(
    COMPARE_PAYLOADS_API,
    {
      immediate: false,
      afterFetch: async (ctx) => {
        const diff = ctx.data?.diff

        diffResult.value = await highlightJSONDiff(JSON.parse(FIRST_PAYLOAD), diff)

        return ctx
      },
      onFetchError: (ctx) => {
        resetApp()

        error.value = typeof ctx.data?.message === 'string'
          ? ctx.data.message
          : 'An error occurred when attempting to compare payloads. Please try again.'

        return ctx
      },
    },
  )
    .get()
    .json()


  // methods
  const resetApp = (): void => {
    isFirstPayloadSent.value = false
    isSecondPayloadSent.value = false

    diffResult.value = null

    resetSecondPayloadCountdown()

    clearError()
  }


  // derived states
  const isProcessStarted = computed(
    () => isSendingFirstPayload.value || isFirstPayloadSent.value || !!error.value,
  )
  const isResettable = computed(() => !!error.value || !!diffResult.value)


  return {
    diffResult,
    error,

    isWaitingForSecondPayload,
    remainingSecondPayloadDelay,

    sendFirstPayload,
    isSendingFirstPayload,

    isSendingSecondPayload,

    isComparingPayloads,

    resetApp,

    isProcessStarted,
    isResettable,
  }
}
