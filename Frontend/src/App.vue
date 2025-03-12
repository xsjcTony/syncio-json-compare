<script setup lang="ts">
import { ref, useId } from 'vue'
import { DEFAULT_SECOND_PAYLOAD_DELAY } from '@/constants'
import Alert from '@components/Alert.vue'
import Button from '@components/Button.vue'
import { useJsonCompare } from '@composables/jsonCompare'
import Layout from '@layouts/Layout.vue'


const secondPayloadDelayRef = ref<number>(DEFAULT_SECOND_PAYLOAD_DELAY)


const {
  isProcessStarted,
  isResettable,

  error,
  diffResult,

  isSendingFirstPayload,
  isSendingSecondPayload,

  isWaitingForSecondPayload,
  remainingSecondPayloadDelay,

  isComparingPayloads,

  sendFirstPayload,
  resetApp,

} = useJsonCompare(secondPayloadDelayRef)


const secondPayloadDelayInputId = useId()
</script>


<template>
  <Layout>
    <main class="flex-1 container py-24 flex flex-col gap-y-24">
      <label class="flex justify-center items-center gap-x-8" :for="secondPayloadDelayInputId">
        2nd payload delay:
        <input
          :id="secondPayloadDelayInputId"
          v-model="secondPayloadDelayRef"
          class="border border-gray-500 p-8 rounded-lg"
          :disabled="isProcessStarted"
          inputmode="numeric"
          :max="DEFAULT_SECOND_PAYLOAD_DELAY"
          min="5"
          type="number"
        />
        seconds
      </label>

      <div class="flex justify-evenly">
        <Button :disabled="isProcessStarted" @click="() => sendFirstPayload()">
          Upload JSON
        </Button>
        <Button :disabled="!isResettable" type="danger" @click="() => resetApp()">
          Reset
        </Button>
      </div>

      <div class="flex-1 flex justify-center items-center">
        <Alert v-if="error" type="error">{{ error }}</Alert>
        <Alert v-else-if="isSendingFirstPayload">🕒 Sending the first payload...</Alert>
        <Alert v-else-if="isWaitingForSecondPayload">
          <p>✅ The first payload is successfully sent.</p>
          <p>✨ Sending the second payload in {{ remainingSecondPayloadDelay }} seconds...</p>
        </Alert>
        <Alert v-else-if="isSendingSecondPayload">🕒 Sending the second payload...</Alert>
        <Alert v-else-if="isComparingPayloads">🕒 Busy comparing payloads...</Alert>
        <div v-else-if="diffResult" class="overflow-x-auto bg-neutral-950 rounded-lg" v-html="diffResult" />
      </div>
    </main>
  </Layout>
</template>
