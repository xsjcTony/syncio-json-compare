<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '@utils/className'


type ButtonVariantsProps = VariantProps<typeof buttonVariants>

// eslint-disable-next-line ts/consistent-type-definitions
interface ButtonProps extends /* @vue-ignore */ Omit<ButtonHTMLAttributes, 'type'> {
  type?: ButtonVariantsProps['type']
  htmlType?: ButtonHTMLAttributes['type']
}


const { type = 'primary', htmlType = 'button', ...props } = defineProps<ButtonProps>()


const buttonVariants = cva(
  'px-16 py-8 font-bold inline-flex justify-center items-center whitespace-nowrap rounded-md cursor-pointer disabled:cursor-not-allowed transition-[background-color] duration-250 disabled:bg-neutral-700',
  {
    variants: {
      type: {
        primary: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
        danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
      },
    },
  },
)

const button = (variants: ButtonVariantsProps): string => buttonVariants(variants)
</script>


<template>
  <button v-bind="props" :class="cn(button({ type }))" :type="htmlType">
    <slot />
  </button>
</template>
