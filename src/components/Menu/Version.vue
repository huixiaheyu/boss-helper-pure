<script lang="ts" setup>
import { store } from '@/components/StoreIcons'
import { VITE_VERSION } from '@/composables/useHelper'

const emits = defineEmits<{
  close: [value: boolean]
}>()
</script>

<template>
  <UModal title="BossHelper扩展商店">
    <template #body>
      <div>
        <div style="text-align: center; font-size: 14px; color: #606266">
          你的版本: {{ VITE_VERSION }}
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <a v-for="(item, key) in store" :key="key" class="group" :href="item[2]" target="_blank">
          <div
            class="flex h-45 w-35 flex-col items-center gap-2.5 rounded-[12px] border border-[#f6f6f7] bg-[#f6f6f7] p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] transition-[border-color,background-color] duration-250 group-hover:border-[#2fffd9] group-hover:bg-[#bbf8fa]"
          >
            <component :is="item[0]" />
            <img :src="item[3]" alt="store" class="h-5" />
            <span>{{ item[1] }}</span>
          </div>
        </a>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <UButton color="primary" @click="emits('close', false)"> 关闭 </UButton>
      </div>
    </template>
  </UModal>
</template>
