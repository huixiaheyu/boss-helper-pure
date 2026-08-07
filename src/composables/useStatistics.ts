import { watchThrottled } from '@vueuse/core'

import { reactive, ref } from '#imports'
import { counter } from '@/message'
import type { Statistics } from '@/types/formData'
import { getCurDay } from '@/utils'
import deepmerge, { jsonClone } from '@/utils/deepmerge'
import { logger } from '@/utils/logger'

export const todayKey = 'local:web-geek-job-Today'
export const statisticsKey = 'local:web-geek-job-Statistics'

export const useStatistics = () => {
  const date = getCurDay()

  // 注意：今日统计是可变的累积状态，必须用普通 reactive 而非 reactiveComputed，
  // 否则投递过程中对 total/success 的增量会被重算成初始值而丢失。
  const todayData = reactive<Statistics>({
    date,
    success: 0,
    total: 0,
    repeat: 0,
    activityFilter: 0,
    tasks: {},
  })

  const statisticsData = ref<Statistics[]>([])

  async function getStatistics(): Promise<string> {
    await updateStatistics()
    return JSON.stringify(jsonClone({ t: todayData, s: statisticsData.value }))
  }

  async function setStatistics(data: string) {
    const { t, s } = JSON.parse(data)
    deepmerge(todayData, t, { clone: false })
    statisticsData.value = s
    await counter.storageSet(todayKey, t)
    await counter.storageSet(statisticsKey, s)
  }

  watchThrottled(
    todayData,
    (v) => {
      void counter.storageSet(todayKey, jsonClone(v))
    },
    { throttle: 200 },
  )

  async function updateStatistics(curData = jsonClone(todayData)) {
    void counter.storageGet<Statistics[]>(statisticsKey, []).then((data) => {
      statisticsData.value = data
    })

    const g = await counter.storageGet(todayKey, curData)
    logger.debug('统计数据:', date, g)
    if (g.date === date) {
      deepmerge(todayData, g, { clone: false })
      return g
    }

    const statistics = await counter.storageGet(statisticsKey, [])

    const newStatistics = [g, ...statistics]
    await counter.storageSet(statisticsKey, newStatistics)
    await counter.storageSet(todayKey, curData)
    statisticsData.value = newStatistics
  }

  return {
    todayData,
    statisticsData,
    updateStatistics,
    getStatistics,
    setStatistics,
  }
}
