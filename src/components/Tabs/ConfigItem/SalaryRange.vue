<script lang="ts" setup>
import { computed, ref } from 'vue'

import { useConf } from '@/composables/conf'

const conf = useConf()

const calcOpen = ref(false)
const salaryRangeRef = ref()

// ---- 主配置：直接选定 xx-xx 元 或 xx-xx K ----
const unit = computed<'yuan' | 'K'>({
  get: () => conf.formData.salaryRange.unit,
  set: (v) => {
    const old = conf.formData.salaryRange.unit
    if (old === v) return
    // 切换单位时同步换算存储值(元/月 <-> K)
    const factor = v === 'K' ? 0.001 : 1000
    const v0 = Math.round(conf.formData.salaryRange.value[0] * factor)
    const v1 = Math.round(conf.formData.salaryRange.value[1] * factor)
    conf.formData.salaryRange.value[0] = v0
    conf.formData.salaryRange.value[1] = v1
    conf.formData.salaryRange.unit = v
  },
})

// 当前单位下展示的 最小/最大 值(双向)
const displayMin = computed<number>({
  get: () => {
    const v = conf.formData.salaryRange.value[0]
    return unit.value === 'K' ? v / 1000 : v
  },
  set: (n) => {
    const factor = unit.value === 'K' ? 1000 : 1
    conf.formData.salaryRange.value[0] = Math.round((n || 0) * factor)
  },
})
const displayMax = computed<number>({
  get: () => {
    const v = conf.formData.salaryRange.value[1]
    return unit.value === 'K' ? v / 1000 : v
  },
  set: (n) => {
    const factor = unit.value === 'K' ? 1000 : 1
    conf.formData.salaryRange.value[1] = Math.round((n || 0) * factor)
  },
})

// ---- 工作制换算参数 ----
const workDays = computed<number>({
  get: () => conf.formData.salaryRange.workDays,
  set: (n) => {
    conf.formData.salaryRange.workDays = Math.max(1, Number(n) || 21.75)
  },
})
const workHours = computed<number>({
  get: () => conf.formData.salaryRange.workHours,
  set: (n) => {
    conf.formData.salaryRange.workHours = Math.max(1, Number(n) || 8)
  },
})

// 工作制预设
const workPresets = [
  { label: '双休(21.75天/8h)', days: 21.75, hours: 8 },
  { label: '大小周(24天/8h)', days: 24, hours: 8 },
  { label: '单休(26天/8h)', days: 26, hours: 8 },
  { label: '996(26天/12h)', days: 26, hours: 12 },
  { label: '007(30天/24h)', days: 30, hours: 24 },
]
// 当前是否命中预设
const activePreset = computed<string>(() => {
  const hit = workPresets.find(
    (p) => p.days === conf.formData.salaryRange.workDays && p.hours === conf.formData.salaryRange.workHours,
  )
  return hit ? hit.label : 'custom'
})

function applyPreset(label: string) {
  if (label === 'custom') return
  const preset = workPresets.find((p) => p.label === label)
  if (!preset) return
  conf.formData.salaryRange.workDays = preset.days
  conf.formData.salaryRange.workHours = preset.hours
}

// ---- 换算：以 元/月 为核心，时薪/日薪/月薪 互相联动 ----
const monthMin = computed<number>({
  get: () => conf.formData.salaryRange.value[0],
  set: (n) => {
    conf.formData.salaryRange.value[0] = Math.round(n || 0)
  },
})
const monthMax = computed<number>({
  get: () => conf.formData.salaryRange.value[1],
  set: (n) => {
    conf.formData.salaryRange.value[1] = Math.round(n || 0)
  },
})

const dayMin = computed<number>({
  get: () => Math.round(monthMin.value / workDays.value),
  set: (n) => {
    monthMin.value = Math.round((n || 0) * workDays.value)
    hourMin.value = Math.round((n || 0) / workHours.value)
  },
})
const dayMax = computed<number>({
  get: () => Math.round(monthMax.value / workDays.value),
  set: (n) => {
    monthMax.value = Math.round((n || 0) * workDays.value)
    hourMax.value = Math.round((n || 0) / workHours.value)
  },
})
const hourMin = computed<number>({
  get: () => Math.round(monthMin.value / workDays.value / workHours.value),
  set: (n) => {
    const d = Math.round((n || 0) * workHours.value)
    monthMin.value = Math.round(d * workDays.value)
  },
})
const hourMax = computed<number>({
  get: () => Math.round(monthMax.value / workDays.value / workHours.value),
  set: (n) => {
    const d = Math.round((n || 0) * workHours.value)
    monthMax.value = Math.round(d * workDays.value)
  },
})

const modeText = computed(() =>
  conf.formData.salaryRange.value[2] ? '严格' : '宽松',
)

function toggleMode() {
  conf.formData.salaryRange.value[2] = !conf.formData.salaryRange.value[2]
}

// 单位显示文本与点击切换
const unitText = computed(() => (unit.value === 'K' ? 'K' : '元'))

function toggleUnit() {
  unit.value = unit.value === 'K' ? 'yuan' : 'K'
}
</script>

<template>
  <FormItem
    label="薪资范围"
    data-help="直接选定薪资范围(元/K)，可切换到严格或宽松匹配；点击「计算」可查看并微调 时/日/月 薪资"
    v-model:enable="conf.formData.salaryRange.enable"
    class="flex-1"
    ref="salaryRangeRef"
  >
    <template #labelExtra>
      <UButton
        variant="link"
        size="sm"
        class="!px-0"
        :color="modeText === '严格' ? 'warning' : 'primary'"
        @click="toggleMode"
      >
        {{ modeText }}
      </UButton>
    </template>
    <div class="flex flex-wrap items-center gap-2">
      <UInputNumber v-model="displayMin" :min="0" class="w-24" :increment="false" :decrement="false" />
      <span class="mono-label">—</span>
      <UInputNumber v-model="displayMax" :min="0" class="w-24" :increment="false" :decrement="false" />
      <UButton variant="soft" size="sm" @click="toggleUnit"> {{ unitText }} </UButton>
      <UButton size="sm" @click="calcOpen = !calcOpen"> 计算 </UButton>
    </div>

    <UPopover
      :reference="salaryRangeRef"
      :open="calcOpen"
      placement="top"
      trigger="click"
      @update:open="calcOpen = $event"
    >
      <template #content>
        <div class="p-3 flex flex-col gap-3 max-w-85">
          <UAlert
            title="匹配规则: 宽松 = 薪资范围有任何重叠即匹配(如10-20K: 15-20K, 15-21K, 20-26K 都满足, 21-22K 不满足); 严格 = 目标薪资需完全在职位范围内(如10-20K: 10-15K 和 15-20K 满足, 15-21K 不满足)"
            color="info"
            :close="false"
          />
          <UAlert
            title="换算以「元/月」为核心: 日薪 = 月薪 ÷ 每月工作天数, 时薪 = 日薪 ÷ 每日小时数; 可切换工作制，编辑任一单位会自动反向联动"
            color="info"
            :close="false"
          />
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="mono-label w-14">工作制</span>
              <USelect
                :model-value="activePreset"
                :items="[
                  ...workPresets.map((p) => ({ label: p.label, value: p.label })),
                  { label: '自定义', value: 'custom' },
                ]"
                class="flex-1"
                @update:model-value="(v: any) => applyPreset(v as string)"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="mono-label w-14">月工作天数</span>
              <UInputNumber v-model="workDays" :min="1" class="w-24" :step="0.5" />
              <span class="mono-label">天</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="mono-label w-14">日工作小时</span>
              <UInputNumber v-model="workHours" :min="1" :max="24" class="w-24" :step="0.5" />
              <span class="mono-label">时</span>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="mono-label w-14">月薪</span>
              <UInputNumber v-model="monthMin" :min="0" class="w-24" :increment="false" :decrement="false" />
              <span class="mono-label">—</span>
              <UInputNumber v-model="monthMax" :min="0" class="w-24" :increment="false" :decrement="false" />
              <UBadge>元/月</UBadge>
            </div>
            <div class="flex items-center gap-2">
              <span class="mono-label w-14">日薪</span>
              <UInputNumber v-model="dayMin" :min="0" class="w-24" :increment="false" :decrement="false" />
              <span class="mono-label">—</span>
              <UInputNumber v-model="dayMax" :min="0" class="w-24" :increment="false" :decrement="false" />
              <UBadge>元/天</UBadge>
            </div>
            <div class="flex items-center gap-2">
              <span class="mono-label w-14">时薪</span>
              <UInputNumber v-model="hourMin" :min="0" class="w-24" :increment="false" :decrement="false" />
              <span class="mono-label">—</span>
              <UInputNumber v-model="hourMax" :min="0" class="w-24" :increment="false" :decrement="false" />
              <UBadge>元/时</UBadge>
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </FormItem>
</template>
