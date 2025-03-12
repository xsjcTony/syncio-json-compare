<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from '@utils/className'


type AlertVariantsProps = VariantProps<typeof alertVariants>

type ErrorAlertProps = {
  type?: AlertVariantsProps['type']
}


const { type = 'default' } = defineProps<ErrorAlertProps>()


const alertVariants = cva(
  'px-16 py-8 rounded-lg text-lg text-center',
  {
    variants: {
      type: {
        'default': 'bg-gray-700 text-gray-300',
        error: 'bg-red-950 text-red-300',
      },
    },
  },
)

const alert = (variants: AlertVariantsProps): string => alertVariants(variants)
</script>


<template>
  <div :class="cn(alert({ type }))">
    <slot />
  </div>
</template>
