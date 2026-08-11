<script lang="ts" setup>
defineProps<{
  disabled?: boolean
}>()

const value = defineModel<string[]>('value', { required: true })
// const options = defineModel<string[]>('options', { required: true })

const delimiter = /,|\s|\||，/
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
    :ui="{
      root: 'disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed',
      input: 'disabled:cursor-not-allowed',
    }"
  />
</template>
