<template>
  <div
    class="p-4 h-full flex items-center justify-center"
    :style="{ textAlign: align }"
  >
    <p
      class="font-medium"
      :style="{
        fontSize: fontSize || '1.125rem',
        fontWeight: fontWeight || '500',
        color: color || '#111827'
      }"
    >
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { SimpleTextProps } from '@/types/widget'

withDefaults(defineProps<SimpleTextProps>(), {
  text: '文字內容',
  fontSize: '1.125rem',
  fontWeight: '500',
  color: '#111827',
  align: 'center'
})
</script>
