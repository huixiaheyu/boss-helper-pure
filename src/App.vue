<script lang="ts" setup>
import { TabsItem } from '@nuxt/ui'
import { computed, onMounted, ref } from 'vue'

import JobCards from '@/components/JobCards.vue'
import Config from '@/components/Tabs/Config.vue'
import Filter from '@/components/Tabs/Filter.vue'
import Logs from '@/components/Tabs/Logs.vue'
import Statistics from '@/components/Tabs/Statistics.vue'
import { useConf, appearanceConf } from '@/composables/conf'
import { useStatistics } from '@/composables/useStatistics'

import { useHelper } from './composables/useHelper'

const { todayData } = useStatistics()
const conf = useConf()
const helper = useHelper()

const items = computed<TabsItem[]>(() => {
  const configs = [
    { slot: 'statistics', label: '统计', help: '失败是成功她妈' },
    { slot: 'filter', label: '筛选' },
    { slot: 'config', label: '配置', help: '好好看，好好学' },
    { slot: 'logs', label: '日志', help: '反正你也不看' },
  ] satisfies (TabsItem | boolean | null | undefined | '')[]

  return configs.filter((item) => !!item) as TabsItem[]
})

// const externalFilter = ref<HTMLElement>()
const container = ref<HTMLElement>()

onMounted(() => {
  void conf.confInit()
})
</script>

<template>
  <div
    class="shadow-wrapper w-284 max-w-284 min-w-284 m-10 mx-auto mb-24"
    :style="{
      marginRight:
        appearanceConf.leftChat && appearanceConf.contentOffset != 25
          ? `${appearanceConf.contentOffset}%`
          : undefined,
      marginLeft:
        !appearanceConf.leftChat && appearanceConf.contentOffset != 25
          ? `${appearanceConf.contentOffset}%`
          : undefined,
    }"
    ref="container"
  >
    <UApp :portal="container" :toaster="{ position: 'top-right', ui: { viewport: 'z-100000' } }">
      <div>
        <div class="rounded-xl pt-3 pb-6 px-4 bg-default flex flex-col">
          <div class="flex gap-2 items-center">
            <span class="text-xl">{{ !appearanceConf.hideHeader ? 'Boss-Helper' : 'Helper' }}</span>
            <span v-if="todayData.total > 0" style="margin-right: 15px">
              今日投递: {{ todayData.success }}/{{ conf.formData.deliveryLimit.value }}
            </span>
            <span v-if="helper.workflow && helper.workflow.total.value > 0">
              当前页面处理: {{ helper.workflow.current.value + 1 }}/{{
                helper.workflow.total.value
              }}
            </span>
          </div>

          <UTabs
            data-help="no-help"
            :items="items"
            variant="link"
            :ui="{ list: 'items-center' }"
            :unmount-on-hide="false"
          >
            <template #statistics>
              <Statistics />
            </template>
            <template #filter>
              <Filter />
            </template>
            <template #config><Config /></template>
            <template #logs><Logs /></template>
          </UTabs>
        </div>
      </div>
      <JobCards />
    </UApp>
  </div>
</template>
