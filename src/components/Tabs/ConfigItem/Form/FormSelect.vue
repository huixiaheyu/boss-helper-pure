<script lang="ts" setup>
defineProps<{
  disabled?: boolean
}>()

const value = defineModel<string[]>('value', { required: true })
// const options = defineModel<string[]>('options', { required: true })

const delimiter = /,|\s|\||，/
const toast = useToast()

// UInputTags 添加重复标签时会 emit 'invalid' 事件(duplicate:false 时), 给用户明确提示
function onInvalid(payload: string | number | bigint) {
  toast.add({
    title: `「${String(payload)}」已存在，未重复添加`,
    color: 'warning',
  })
}
</script>

<template>
  <UInputTags
    v-model="value"
    placeholder=""
    :delimiter="delimiter"
    addOnTab
    addOnBlur
    :duplicate="false"
    :disabled
    @invalid="onInvalid"
    :ui="{
      root: 'disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed',
      input: 'disabled:cursor-not-allowed',
    }"
  />
</template>
