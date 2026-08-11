<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import Alert from '@/components/Alert.vue'
import { useConf } from '@/composables/conf'
import { useHelper } from '@/composables/useHelper'

const ctx = useHelper()

// 与投递流程共享同一统计实例，投递时实时联动
const statistics = ctx.statistics
const todayData = statistics.todayData

// const { next, page } = usePager()
const conf = useConf()
const statisticCycle = ref(1)

const statisticCycleData = [
  {
    label: '近三日投递',
    help: '愿你每一次投递都能得到回应',
    date: 3,
  },
  {
    label: '本周投递',
    help: '愿你早日找到心满意足的工作',
    date: 7,
  },
  {
    label: '本月投递',
    help: '愿你在面试中得到满意的结果',
    date: 30,
  },
  {
    label: '历史投递',
    help: '愿你能早九晚五还双休带五险',
    date: -1,
  },
]

const cycle = computed(() => {
  const date = statisticCycleData[statisticCycle.value].date
  let ans = 0
  for (
    let i = 0;
    // eslint-disable-next-line no-unmodified-loop-condition
    (date === -1 || i < date - 1) && i < statistics.statisticsData.value.length;
    i++
  ) {
    ans += statistics.statisticsData.value[i].success
  }
  return ans
})

// 安全的百分比计算，避免 total 为 0 时出现 NaN
const pct = (numerator: number) => {
  const total = todayData.total
  if (!total) return '0.0'
  return ((numerator / total) * 100).toFixed(1)
}

// 已沟通(重复投递)数量: 从「已沟通」任务跳过计数统计(跳过结果的状态为 warn)
const repeatCount = computed(
  () => todayData.tasks?.['已沟通']?.warn ?? 0,
)
// 不活跃数量: 从「活跃度过滤」任务跳过计数统计
const activityCount = computed(
  () => todayData.tasks?.['活跃度过滤']?.warn ?? 0,
)

onMounted(() => {
  statistics.updateStatistics()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="conf.configLevel.intermediate" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div class="stat-tile tile-cream" data-help="统计当天脚本扫描过的所有岗位">
        <div class="stat-label">岗位总数</div>
        <div class="stat-num">
          {{ todayData.total }} <span class="text-sm opacity-60">份</span>
        </div>
      </div>
      <div class="stat-tile tile-coral" data-help="统计当天岗位过滤的比例,被过滤/总数">
        <div class="stat-label">过滤比例</div>
        <div class="stat-num">
          {{ pct(todayData.total - todayData.success) }}
          <span class="text-sm opacity-60">%</span>
        </div>
      </div>
      <div class="stat-tile tile-lav" data-help="统计当天已沟通(避免重复投递)的岗位占比">
        <div class="stat-label">重复比例</div>
        <div class="stat-num">
          {{ pct(repeatCount) }}
          <span class="text-sm opacity-60">%</span>
        </div>
      </div>
      <div class="stat-tile tile-mint" data-help="统计当天岗位中的不活跃占比">
        <div class="stat-label">活跃比例</div>
        <div class="stat-num">
          {{ pct(activityCount) }}
          <span class="text-sm opacity-60">%</span>
        </div>
      </div>
      <div class="stat-tile tile-sky" :data-help="statisticCycleData[statisticCycle].help">
        <div class="stat-label">
          <UDropdownMenu
            :items="
              statisticCycleData.map((item, index) => ({
                label: item.label,
                onSelect: () => (statisticCycle = index),
              }))
            "
          >
            <span class="cursor-pointer flex items-center gap-1">
              {{ statisticCycleData[statisticCycle].label }}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 1024 1024">
                <path
                  fill="currentColor"
                  d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"
                />
              </svg>
            </span>
          </UDropdownMenu>
        </div>
        <div class="stat-num">
          {{ cycle + todayData.success }} <span class="text-sm opacity-60">份</span>
        </div>
      </div>
    </div>
    <div class="flex flex-row gap-3 items-center">
      <UFieldGroup>
        <UButton
          color="primary"
          data-help="点击开始就会开始投递"
          :loading="ctx.workflow?.status.value === 'running'"
          @click="ctx.start()"
        >
          {{ ctx.workflow?.status.value === 'stop' ? '继续' : '开始' }}
        </UButton>
        <UButton
          v-if="ctx.workflow?.status.value === 'stop'"
          color="warning"
          data-help="重置已被筛选的岗位，开始将重新处理"
          @click="ctx.reset()"
        >
          重置筛选
        </UButton>
        <UButton
          v-if="ctx.workflow?.status.value === 'running'"
          color="warning"
          data-help="暂停后应该能继续"
          @click="ctx.stop()"
        >
          暂停
        </UButton>
      </UFieldGroup>
      <UProgress
        data-help="我会统计当天脚本投递的数量,该记录并不准确"
        class="flex-1"
        :value="Number(((todayData.success / conf.formData.deliveryLimit.value) * 100).toFixed(1))"
      />
    </div>
  </div>
</template>

<style lang="scss"></style>
