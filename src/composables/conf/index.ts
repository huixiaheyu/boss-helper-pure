import { reactiveComputed, useStorageAsync, watchThrottled } from '@vueuse/core'
import { reactive, ref, toRaw } from 'vue'

import { counter } from '@/message'
import { ExtStorage } from '@/message'
import type { FormData, FormDataRange, FormSalaryRangeInput } from '@/types/formData'
import deepmerge, { jsonClone } from '@/utils/deepmerge'
import { exportJson, importJson } from '@/utils/jsonImportExport'
import { logger } from '@/utils/logger'

import { defaultFormData } from './info'

export * from './info'

const formDataPresetKey = 'local:FormDataPrese'
const formDataPresetsKey = 'local:FormDataPreses'

export const appearanceConf = useStorageAsync(
  'appearance-conf',
  {
    hideHeader: false,
    changeIcon: false,
    dynamicTitle: false,
    changeBackground: false,
    blurCard: false,
    listSink: false,
    contentOffset: 25, // 0-25, 25则为关闭
    leftChat: false,
  },
  ExtStorage,
  { mergeDefaults: true },
)
const isLoading = ref(true)
const formData: FormData = reactive(defaultFormData)
const formDataPreset = ref('default')
const formDataPresets = ref([
  {
    label: '默认配置',
    value: 'default',
  },
])

const formDataKey = () => {
  if (formDataPreset.value !== 'default') {
    return `local:web-geek-job-FormData-${formDataPreset.value}`
  }
  return 'local:web-geek-job-FormData'
}

watchThrottled(
  formData,
  (v) => {
    logger.debug('formData改变', toRaw(v))
  },
  { throttle: 2000 },
)

const FROM_VERSION: [string, (from: Partial<FormData>) => Partial<FormData>][] = [
  [
    '20260810',
    (from) => {
      const sr = from.salaryRange as FormSalaryRangeInput & {
        advancedValue?: Record<string, FormDataRange>
      }
      if (sr && 'advancedValue' in sr) {
        // 旧格式: value 为 K, 统一转为 元/月; advancedValue 改为按需换算
        sr.value = [
          Math.round(sr.value[0] * 1000),
          Math.round(sr.value[1] * 1000),
          sr.value[2],
        ]
        ;(sr as FormSalaryRangeInput).unit = 'K'
        delete sr.advancedValue
      } else if (sr && !('unit' in sr)) {
        ;(sr as FormSalaryRangeInput).unit = 'K'
      }
      // 补充工作制换算参数(缺失时用双休默认)
      if (sr && !('workDays' in sr)) {
        ;(sr as FormSalaryRangeInput).workDays = 21.75
        ;(sr as FormSalaryRangeInput).workHours = 8
      }
      return from
    },
  ],
  [
    '20250826',
    (from) => {
      if (from.salaryRange && typeof from.salaryRange.value === 'string') {
        const [min, max] = (from.salaryRange.value as string).split('-').map(Number)
        from.salaryRange.value = [min, max, false]
      }
      if (from.companySizeRange && typeof from.companySizeRange.value === 'string') {
        const [min, max] = (from.companySizeRange.value as string).split('-').map(Number)
        from.companySizeRange.value = [min, max, false]
      }
      return from
    },
  ],
  [
    '20260521',
    (from) => {
      if (from.jobAddress) {
        from.jobAddress = {
          ...from.jobAddress,
          include: true,
        }
      }
      return from
    },
  ],
  [
    '20260718',
    (from) => {
      if (!('delay' in from) || typeof from.delay !== 'object') {
        return from
      }
      Object.entries(from.delay as Record<string, number>).forEach(([key, value]) => {
        // @ts-ignore
        from[`delay${key.charAt(0).toUpperCase() + key.slice(1)}`] = value
      })
      delete from['delay']
      return from
    },
  ],
]

export const useConf = () => {
  const toast = useToast()

  async function formDataHandler(from: Partial<FormData>) {
    try {
      for (let i = FROM_VERSION.length - 1; i >= 0; i--) {
        const [version, fn] = FROM_VERSION[i]
        if ((from?.version ?? '20240401') >= version) {
          break
        }
        from = fn(from)
        from.version = version
      }
    } catch (err) {
      logger.error('用户配置初始化失败', err)
      toast.add({
        title: `用户配置初始化失败: ${String(err)}`,
        color: 'error',
      })
    }
    return from
  }

  async function init() {
    isLoading.value = true
    try {
      const rawFormDataPreset = await counter.storageGet(formDataPresetKey, 'default')
      const rawFormDataPresets = await counter.storageGet(formDataPresetsKey, [
        {
          label: '默认配置',
          value: 'default',
        },
      ])
      formDataPreset.value = rawFormDataPreset
      formDataPresets.value = rawFormDataPresets

      let from = await counter.storageGet<Partial<FormData>>(formDataKey(), {})
      from = (await formDataHandler(from)) ?? from
      const data = deepmerge<FormData>(defaultFormData, from)
      Object.assign(formData, data)
    } catch (e) {
      toast.add({
        title: `配置加载失败: ${String(e)}`,
        color: 'error',
      })
      logger.error('配置加载失败', e)
    } finally {
      isLoading.value = false
    }
  }

  // 保存当前 formData 到当前预设(无提示, 供自动保存/手动保存复用)
  async function saveCurrent() {
    try {
      await counter.storageSet(formDataKey(), jsonClone(formData))
      await counter.storageSet(formDataPresetKey, jsonClone(formDataPreset.value))
      await counter.storageSet(formDataPresetsKey, jsonClone(formDataPresets.value))
      logger.debug('formData已保存')
    } catch (error) {
      logger.error('配置保存失败', error)
      throw error
    }
  }

  async function confSaving() {
    try {
      await saveCurrent()
      toast.add({
        title: '保存成功',
        color: 'success',
      })
    } catch (error: any) {
      toast.add({
        title: `保存失败: ${error.message}`,
        color: 'error',
      })
      throw error
    }
  }

  // 恢复默认配置并自动保存(取代旧的 重载/清空)
  async function confResetDefault() {
    deepmerge(formData, defaultFormData, { clone: false })
    await saveCurrent()
    logger.debug('formData已恢复默认')
    toast.add({
      title: '已恢复默认配置',
      color: 'success',
    })
  }

  async function confExport() {
    const data = deepmerge<FormData>(defaultFormData, await counter.storageGet(formDataKey(), {}))
    exportJson(data, '打招呼配置')
  }

  async function confImport() {
    let jsonData = await importJson<Partial<FormData>>()
    jsonData = (await formDataHandler(jsonData)) ?? jsonData
    deepmerge(formData, jsonData, { clone: false })
    await saveCurrent()
    toast.add({
      title: '导入成功, 已自动保存',
      color: 'success',
    })
  }

  // 仅使用高级模式，移除其他配置级别
  const configLevel = reactiveComputed(() => {
    return {
      intermediate: true,
      advanced: true,
      expert: false,
    }
  })

  async function createPreset(label: string) {
    isLoading.value = true
    try {
      const value = Date.now().toString()
      formDataPresets.value.push({
        label,
        value,
      })
      formDataPreset.value = value

      await counter.storageSet(formDataPresetKey, formDataPreset.value)
      await counter.storageSet(formDataPresetsKey, formDataPresets.value)
      await counter.storageSet(formDataKey(), jsonClone(formData))

      toast.add({
        title: '预设创建成功',
        color: 'success',
      })
    } catch (e) {
      toast.add({
        title: `预设创建失败: ${String(e)}`,
        color: 'error',
      })
      logger.error('预设创建失败', e)
    } finally {
      isLoading.value = false
    }
  }

  async function switchPreset(value: string) {
    isLoading.value = true
    try {
      formDataPreset.value = value
      counter.storageSet(formDataPresetKey, value)
      await init()
    } catch (e) {
      toast.add({
        title: `预设切换失败: ${String(e)}`,
        color: 'error',
      })
      logger.error('预设切换失败', e)
    } finally {
      isLoading.value = false
    }
  }

  // 自动保存: 配置变更后防抖保存到当前预设
  let autoSaveTimer: ReturnType<typeof setTimeout> | undefined
  watch(
    formData,
    () => {
      // 加载/切换预设期间不触发自动保存, 并取消待执行的保存
      if (isLoading.value) {
        if (autoSaveTimer) clearTimeout(autoSaveTimer)
        return
      }
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
      autoSaveTimer = setTimeout(() => {
        saveCurrent().catch((error) => {
          toast.add({
            title: `自动保存失败: ${String(error)}`,
            color: 'error',
          })
        })
      }, 800)
    },
    { deep: true },
  )

  return {
    confInit: init,
    confSaving,
    confResetDefault,
    confExport,
    confImport,
    formDataKey,
    defaultFormData,
    formData,
    configLevel,
    formDataPreset,
    formDataPresets,
    createPreset,
    switchPreset,
    isLoading,
  }
}
