<script lang="ts" setup>
import { formInfoData, useConf } from '@/composables/conf'
import { useHelper } from '@/composables/useHelper/index.js'
import { type ConfigItem } from '@/composables/useHelper/type'

import Address from './Address.vue'
import SalaryRangeComponent from './Form/SalaryRange.vue'
import SalaryRange from './SalaryRange.vue'

const props = defineProps<{
  item: ConfigItem
}>()

const helper = useHelper()
const conf = useConf()
</script>

<template>
  <Alert v-if="item.type === 'alert'" v-bind="item" />
  <Address v-else-if="item.type === 'address'" />
  <FormItem
    v-else-if="item.type === 'companySizeRange'"
    label="公司规模范围"
    data-help="投递工作的公司规模, 推荐使用boss自带选项进行筛选。严格宽松定义在薪资高级配置中有写"
    v-model:enable="conf.formData.companySizeRange.enable"
    :disabled="conf.formData.companySizeRange.enable"
    class="flex-1"
  >
    <template #default="{ disabled }">
      <SalaryRangeComponent
        :controls="false"
        :value="conf.formData.companySizeRange.value"
        unit="人"
        :show="true"
        :disabled="disabled"
      />
    </template>
  </FormItem>
  <SalaryRange v-else-if="item.type === 'salaryRange'" />

  <UFormField v-else-if="item.type === 'inputNumber'" v-bind="item.fieldProps">
    <UFieldGroup>
      <UInputNumber v-model="conf.formData[item.key]" v-bind="item.inputNumberProps" />
      <UBadge v-if="item.unit" :label="item.unit" />
    </UFieldGroup>
  </UFormField>

  <FormItem
    v-else-if="item.type === 'select'"
    v-bind="formInfoData[item.key]"
    v-model:enable="conf.formData[item.key].enable"
    v-model:include="conf.formData[item.key].include"
    :disabled="conf.formData[item.key].enable || helper.workflowRunning.value"
  >
    <template #default="{ disabled }">
      <formSelect
        v-model:value="conf.formData[item.key].value"
        v-model:options="conf.formData[item.key].options"
        :disabled="disabled"
      />
    </template>
  </FormItem>
  <span
    v-else-if="item.type === 'checkbox'"
    v-bind="formInfoData[item.key]"
    :title="formInfoData[item.key]['data-help']"
  >
    <UCheckbox v-model="conf.formData[item.key].value" :label="formInfoData[item.key]['label']" />
  </span>

  <div v-else-if="item.type === 'div'" v-bind="item">
    <template v-for="(value, index) in item.items" :key="index">
      <ConfigItem v-if="value" :item="value" />
    </template>
  </div>
</template>
