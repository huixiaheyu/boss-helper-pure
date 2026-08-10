<script lang="ts" setup>
import { TabsItem } from '@nuxt/ui'
import { computed, onMounted, ref } from 'vue'

import JobCards from '@/components/JobCards.vue'
import Config from '@/components/Tabs/Config.vue'
import Filter from '@/components/Tabs/Filter.vue'
import Logs from '@/components/Tabs/Logs.vue'
import Statistics from '@/components/Tabs/Statistics.vue'
import { useConf, appearanceConf } from '@/composables/conf'

import { useHelper } from './composables/useHelper'

const conf = useConf()
const helper = useHelper()
// 与投递流程共享同一统计实例，投递时今日数据实时联动
const statistics = helper.statistics
const todayData = statistics.todayData

const items = computed<TabsItem[]>(() => {
  const configs = [
    { slot: 'statistics', label: '统计' },
    { slot: 'filter', label: '搜索' },
    { slot: 'config', label: '配置' },
    { slot: 'logs', label: '日志' },
    { slot: 'about', label: '关于' },
  ] satisfies (TabsItem | boolean | null | undefined | '')[]

  return configs.filter((item) => !!item) as TabsItem[]
})

// 求职等级：把今日投递量映射为可感知的游戏化进度
const LEVEL_STEP = 50 // 每 50 次投递升 1 级
const levelProgress = computed(() => {
  const inLevel = todayData.success % LEVEL_STEP
  return Math.min(100, Math.round((inLevel / LEVEL_STEP) * 100))
})

// const externalFilter = ref<HTMLElement>()
const container = ref<HTMLElement>()

onMounted(() => {
  void conf.confInit()
})
</script>

<template>
  <div
    class="shadow-wrapper w-284 max-w-284 min-w-284 m-10 mx-auto mb-6"
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
        <div class="boss-panel relative overflow-hidden pt-4 pb-4 px-5 flex flex-col h-[640px]">
          <div class="stage-glow" />
          <div class="relative z-10 flex flex-col flex-1 min-h-0">
          <!-- 顶部横栏 + 等级进度（签名游戏化元素） -->
          <div class="flex items-center justify-between gap-4 mb-4">
            <div class="flex items-baseline gap-3">
              <span
                class="serif-title text-2xl tracking-tight"
                style="color: var(--accent)"
              >
                {{ !appearanceConf.hideHeader ? 'Boss-Helper Pure' : 'Helper' }}
              </span>
              <span class="mono-label hidden sm:inline">纯净版 · 求职助手 · 批量投递</span>
            </div>
            <div class="flex items-center gap-4">
              <span v-if="helper.workflow && helper.workflow.total.value > 0" class="mono-label">
                页面 {{ helper.workflow.current.value + 1 }}/{{ helper.workflow.total.value }}
              </span>
              <span class="mono-label shrink-0">
                今日投递 {{ todayData.success }}/{{ conf.formData.deliveryLimit.value }}
              </span>
            </div>
          </div>

          <!-- 今日投递进度条 -->
          <div class="xp-bar mb-4"><i :style="{ width: `${levelProgress}%` }" /></div>

          <UTabs
            :items="items"
            variant="link"
            :ui="{
              list: 'items-center shrink-0',
              content: 'flex-1 min-h-0 overflow-y-auto',
            }"
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
            <template #about><About /></template>
          </UTabs>
          </div>
        </div>
      </div>
      <JobCards />
    </UApp>
  </div>
</template>
