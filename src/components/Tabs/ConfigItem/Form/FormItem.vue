<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  label: string
  help?: string
  disabled?: boolean
}>()

const include = defineModel<boolean | undefined>('include', {
  default: undefined,
})
const enable = defineModel<boolean>('enable', { required: true })

// 启用功能后锁定输入框, 防止投递运行中被误改; 需先取消启用才能编辑参数
const inputDisabled = computed(() => enable.value || props.disabled)
</script>

<template>
  <UFormField :data-help="help" :title="help">
    <template #label>
      <UFieldGroup class="flex flex-row gap-1 items-center">
        <UCheckbox v-model="enable" size="sm" />
        <span class="text-sm font-medium whitespace-nowrap">{{ label }}</span>
        <UButton
          class="pl-px"
          v-if="include != null"
          :color="include ? 'primary' : 'warning'"
          variant="link"
          size="sm"
          :disabled="inputDisabled"
          @click.stop="
            () => {
              include = !include
            }
          "
        >
          {{ include ? '包含' : '排除' }}
        </UButton>
        <slot name="labelExtra" />
      </UFieldGroup>
    </template>
    <slot :disabled="inputDisabled" />
  </UFormField>
</template>
