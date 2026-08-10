<script lang="ts" setup>
import Alert from '@/components/Alert.vue'
import { useConf } from '@/composables/conf'
import { getCacheManager } from '@/composables/useApplying'
import { useHelper } from '@/composables/useHelper'

import ConfigItem from './ConfigItem/ConfigItem.vue'

const helper = useHelper()
const conf = useConf()
const configItems = helper.getConfigItems()
</script>

<template>
  <div class="flex flex-col gap-2">
    <UTheme
      :ui="{
        formField: {
          root: 'flex max-sm:flex-col justify-between gap-4 items-center',
          container: 'flex-1',
        },
        input: {
          root: 'w-full',
        },
        inputMenu: {
          root: 'w-full',
        },
        inputTags: {
          root: 'w-full',
        },
      }"
    >
      <Alert v-for="(items, index) in configItems[0]" :key="index" v-bind="items" />
      <UForm :disabled="helper.workflowRunning.value || conf.isLoading.value">
        <UAccordion
          type="single"
          collapsible
          :items="configItems[1].filter((item) => !!item)"
          :ui="{ content: 'data-[state=open]:pt-1 data-[state=open]:pb-3 px-2 gap-3' }"
          :unmount-on-hide="false"
          default-value="filter"
        >
          <template #body="{ item }">
            <template v-for="(v, i) in item.items" :key="i">
              <ConfigItem v-if="v" :item="v" />
            </template>
          </template>
        </UAccordion>
        <hr class="border-t border-gray-200 dark:border-gray-800" />
        <div class="mt-3 flex flex-row flex-wrap gap-5 items-center">
          <span data-help="可以在网站管理中打开通知权限,当停止时会自动发送桌面端通知提醒。">
            <UCheckbox label="发送通知" v-model="conf.formData.notification.value" />
          </span>
          <span
            v-if="conf.configLevel.expert || conf.formData.useCache.value"
            data-help="开启后会缓存投递记录，避免重复投递，提高效率。但是缓存功能并不积极维护。可能会有bug，或者意外情况，如遇到可尝试清空缓存或者禁用"
          >
            <UCheckbox label="启用缓存" v-model="conf.formData.useCache.value" />
          </span>
          <UButton
            v-if="conf.formData.useCache.value"
            color="warning"
            @click="() => getCacheManager().clearCache()"
          >
            清空缓存
          </UButton>
          <UFormField
            v-if="conf.configLevel.intermediate"
            label="投递数量"
            class="ml-auto"
          >
            <UInputNumber
              label="投递数量"
              data-help="达到上限后会自动暂停，默认100次, 当前boss上限为150"
              v-model="conf.formData.deliveryLimit.value"
              :min="1"
              :max="155"
              :step="10"
            />
          </UFormField>
        </div>
      </UForm>
      <div class="flex flex-row justify-end gap-3 mt-3">
        <UButton
          color="warning"
          data-help="将当前配置重置为默认值并自动保存"
          @click="conf.confResetDefault"
        >
          默认配置
        </UButton>
        <UButton
          v-if="conf.configLevel.intermediate"
          color="warning"
          data-help="互联网就是要分享"
          @click="conf.confImport"
        >
          导入配置
        </UButton>
        <UButton
          v-if="conf.configLevel.intermediate"
          color="warning"
          data-help="互联网就是要分享"
          @click="conf.confExport"
        >
          导出配置
        </UButton>
      </div>
    </UTheme>
  </div>
</template>
