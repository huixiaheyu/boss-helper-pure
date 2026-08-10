import { FormDataRange } from '@/types/formData'

export function rangeMatchFormat(v: FormDataRange, unit: string): string {
  return `${v[0]} - ${v[1]} ${unit} ${v[2] ? '严格' : '宽松'}`
}

// 匹配范围
export function rangeMatch(rangeStr: string, form: FormDataRange): boolean {
  if (!rangeStr) return false
  let [start, end, mode] = form // mode: true=严格(包含)，false=宽松(重叠)
  if (start > end) {
    ;[start, end] = [end, start]
  }
  const re = /(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/
  const m = String(rangeStr).match(re)
  if (!m) return false

  let inputStart = Number.parseFloat(m[1])
  let inputEnd = Number.parseFloat(m[2] != null ? m[2] : m[1])
  if (!Number.isFinite(inputStart) || !Number.isFinite(inputEnd)) return false

  if (inputStart > inputEnd) {
    ;[inputStart, inputEnd] = [inputEnd, inputStart]
  }
  // console.log({
  //     inputStart,inputEnd,start,end
  // })
  if (mode) {
    // 严格：职位范围(input) 完全覆盖 目标范围(form)
    return start <= inputStart && inputEnd <= end
  } else {
    // 宽松：任意重叠（闭区间）
    return Math.max(inputStart, start) <= Math.min(inputEnd, end)
  }
}

// 薪资主配置单位对应的换算系数(存储值 元/月 -> 该单位值)
export function salaryUnitFromMonth(unit: 'yuan' | 'qian' | 'wan', workDays: number): number {
  switch (unit) {
    case 'wan':
      return 10000
    case 'qian':
      return 1000
    default:
      return workDays
  }
}

// 把主配置(元/月区间)按指定单位格式化显示, 如 200 - 1000 元/天
export function formatSalaryRange(
  form: FormDataRange,
  unit: 'yuan' | 'qian' | 'wan',
  workDays: number,
): string {
  const factor = salaryUnitFromMonth(unit, workDays)
  const unitText = unit === 'wan' ? '万/月' : unit === 'qian' ? '千/月' : '元/天'
  const [lo, hi] = [form[0] / factor, form[1] / factor]
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100))
  return `${fmt(lo)} - ${fmt(hi)} ${unitText}`
}

// 直接以数值区间判断是否匹配(薪资主配置为 元/月)
export function matchRange(jobLow: number, jobHigh: number, form: FormDataRange): boolean {
  let [start, end, mode] = form
  if (start > end) {
    ;[start, end] = [end, start]
  }
  let lo = jobLow
  let hi = jobHigh
  if (lo > hi) {
    ;[lo, hi] = [hi, lo]
  }
  if (mode) {
    // 严格：职位范围完全包含 目标范围
    return start <= lo && hi <= end
  }
  // 宽松：要求有实质重叠(开区间), 排除仅在端点"擦边"的情况
  return Math.max(lo, start) < Math.min(hi, end)
}

// 把职位薪资文本解析为 元/月 区间, 解析失败返回 null
// workDays/workHours 为用户配置的工作制换算参数(默认双休 21.75天/8h)
export function parseSalaryToMonth(
  text: string,
  workDays = 21.75,
  workHours = 8,
): [number, number] | null {
  if (!text) return null
  const m = text.match(/(\d+(?:\.\d+)?)\s*[-~～]\s*(\d+(?:\.\d+)?)/)
  let lo: number
  let hi: number
  if (!m) {
    const single = text.match(/(\d+(?:\.\d+)?)/)
    if (!single) return null
    const v = Number.parseFloat(single[1])
    lo = v
    hi = v
  } else {
    lo = Number.parseFloat(m[1])
    hi = Number.parseFloat(m[2])
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null
  if (lo > hi) {
    ;[lo, hi] = [hi, lo]
  }
  // 统一换算为 元/月
  let factor = 1
  if (text.includes('元/时') || text.includes('元/小时')) {
    factor = workHours * workDays
  } else if (text.includes('元/天') || text.includes('元/日')) {
    factor = workDays
  } else if (/k/i.test(text)) {
    factor = 1000
  }
  return [Math.round(lo * factor), Math.round(hi * factor)]
}
