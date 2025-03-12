import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'


export const twMerge = extendTailwindMerge({})


export const cn = (...classNames: ClassValue[]): string => twMerge(clsx(classNames))
