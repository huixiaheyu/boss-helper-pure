import { counter } from '@/message'

import { HelperContext } from '~/composables/useHelper'

import { sameCompanyKey, sameHrKey } from '../../entrypoints/boss/requests'
import { defineTaskHandler, JobStatus, TaskContext, TaskResult } from './type'
import { formatSalaryRange, matchRange, parseSalaryToMonth, rangeMatch, rangeMatchFormat } from './utils'

export class DependencyMissingError extends Error {
  constructor(public taskId: string) {
    super(`Task dependency missing: ${taskId}`)
  }
}

export class HelperConfigError {
  constructor(
    public key: string,
    public message?: string,
  ) {}
}

// function chatBossMessage(_ctx: LogData, _msg: string) {
//   const _d = new Date()
//   // chatMessages.value.push({
//   //   id: d.getTime(),
//   //   role: 'boss',
//   //   content: msg,
//   //   date: [getCurDay(d), getCurTime(d)],
//   //   name: ctx.jobData.brandName,
//   //   avatar: ctx.jobData.brandLogo,
//   // })
// }

function amapHandler<C extends HelperContext<C, T, S>, T, S>(
  ctx: TaskContext<C, T, S>,
  id: string,
  distance: number,
  duration: number,
  amap?: { ok: boolean; distance: number; duration: number },
): TaskResult | void {
  if (!amap || amap.ok === false) {
    return {
      isSkip: true,
      reason: '高德地图未初始化',
    }
  }
  if (distance > 0 && amap.distance > distance * 1000) {
    return {
      isSkip: true,
      reason: `${id}距离超标: ${amap.distance / 1000} 设定: ${ctx.helper.conf.formData.amap.straightDistance}`,
    }
  }
  if (duration > 0 && amap.duration > duration * 60) {
    return {
      isSkip: true,
      reason: `${id}时间超标: ${amap.duration / 60} 设定: ${ctx.helper.conf.formData.amap.drivingDuration}`,
    }
  }
}

export const taskResult = {
  skip: (reason: string, status: JobStatus = 'warn'): TaskResult => ({
    isSkip: true,
    reason,
    status,
  }),
  error: (reason: string): TaskResult => ({
    isSkip: true,
    reason,
    status: 'error',
  }),
}

export class TaskRegistry<C extends HelperContext<C, T, S>, T, S = {}> {
  SameCompanyFilter = defineTaskHandler<C, T, S>(
    '重复沟通-相同公司',
    async (ctx) => {
      if (!ctx.helper.conf.formData.sameCompanyFilter.value) {
        return
      }
      const someSet: Set<string> = new Set<string>()
      const data = await counter.storageGet<Record<string, string[]>>(sameCompanyKey, {})
      for (const id of data[ctx.helper.uid] ?? []) {
        someSet.add(id)
      }
      return {
        fn: async (_, { jobData: data }) => {
          // 以公司链接(含 encryptBrandId)标识公司, 岗位 key 每个岗位唯一, 无法判重
          const companyId = data.brand?.link ?? data.key
          if (someSet.has(companyId)) {
            return taskResult.skip('相同公司已投递')
          }
        },
        after: [
          async (ctx, { jobData: data }) => {
            someSet.add(data.brand?.link ?? data.key)
            if (someSet.size % 3 === 0) {
              const oldData = await counter.storageGet<Record<string, string[]>>(sameCompanyKey, {})
              await counter.storageSet(sameCompanyKey, {
                ...oldData,
                [ctx.helper.uid]: Array.from(someSet ?? []),
              })
            }
          },
        ],
      }
    },
    { label: '相同公司' },
  )

  SameHrFilter = defineTaskHandler<C, T, S>(
    '重复沟通-相同HR',
    async (ctx) => {
      if (!ctx.helper.conf.formData.sameHrFilter.value) {
        return
      }
      const someSet: Set<string> | null = new Set<string>()
      const data = await counter.storageGet<Record<string, string[]>>(sameHrKey, {})
      for (const id of data[ctx.helper.uid] ?? []) {
        someSet.add(id)
      }

      return {
        fn: async (_, { jobData: data }) => {
          // 以 Boss 链接(含 encryptBossId)标识 HR, 岗位 key 每个岗位唯一, 无法判重
          const hrId = data.boss?.link ?? data.key
          if (someSet.has(hrId)) {
            return taskResult.skip('相同hr已投递')
          }
        },
        after: [
          async (ctx, { jobData: data }) => {
            someSet.add(data.boss?.link ?? data.key)
            if (someSet.size % 3 === 0) {
              const oldData = await counter.storageGet<Record<string, string[]>>(sameHrKey, {})
              await counter.storageSet(sameHrKey, {
                ...oldData,
                [ctx.helper.uid]: Array.from(someSet ?? []),
              })
            }
          },
        ],
      }
    },
    { label: '相同HR' },
  )

  jobTitle = defineTaskHandler<C, T, S>('岗位名', (ctx) => {
    if (!ctx.helper.conf.formData.jobTitle.enable) {
      return
    }
    return async (_ctx, { jobData: data }) => {
      const text = data.jobName.toLowerCase()
      if (!text) return taskResult.skip('岗位名为空')
      for (const x of ctx.helper.conf.formData.jobTitle.value) {
        if (text.includes(x.toLowerCase())) {
          if (ctx.helper.conf.formData.jobTitle.include) {
            return
          }
          return {
            isSkip: true,
            reason: `岗位名含有排除关键词 [${x}]`,
          }
        }
      }
      if (ctx.helper.conf.formData.jobTitle.include) {
        return taskResult.skip('岗位名不包含关键词')
      }
    }
  })

  goldHunterFilter = defineTaskHandler<C, T, S>('猎头过滤', (ctx) => {
    if (!ctx.helper.conf.formData.goldHunterFilter.value) {
      return
    }
    return async (_ctx, { jobData: data }) => {
      if (data?.boss.isHeadhunter === true) {
        return {
          isSkip: true,
          reason: '猎头过滤',
        }
      }
    }
  })

  company = defineTaskHandler<C, T, S>('公司名', (ctx) => {
    if (!ctx.helper.conf.formData.company.enable) return
    return async (_ctx, { jobData: data }) => {
      const text = data.brand.name.toLowerCase()
      if (!text) return taskResult.skip('公司名为空')

      for (const x of ctx.helper.conf.formData.company.value) {
        if (!x) {
          continue
        }
        if (text.includes(x.toLowerCase())) {
          if (ctx.helper.conf.formData.company.include) {
            return
          }
          return {
            isSkip: true,
            reason: `公司名含有排除关键词 [${x}]`,
          }
        }
      }
      if (ctx.helper.conf.formData.company.include) {
        return taskResult.skip('公司名不包含关键词')
      }
    }
  })

  salaryRange = defineTaskHandler<C, T, S>('薪资范围', (ctx) => {
    if (!ctx.helper.conf.formData.salaryRange.enable) {
      return
    }
    // 主配置统一为 元/月: [min, max, mode]
    const form = ctx.helper.conf.formData.salaryRange.value
    const salaryUnit = ctx.helper.conf.formData.salaryRange.unit
    const workDays = ctx.helper.conf.formData.salaryRange.workDays
    return async (_ctx, { jobData: data }) => {
      const text = data.salary
      // 优先使用结构化薪资(元/月), 缺失时回退文本解析
      let lo = data.lowSalary
      let hi = data.highSalary
      if (typeof lo !== 'number' || typeof hi !== 'number' || (!lo && !hi)) {
        const parsed = parseSalaryToMonth(text, workDays, ctx.helper.conf.formData.salaryRange.workHours)
        if (!parsed) {
          // 无法解析(如"面议"), 不拦截
          return
        }
        ;[lo, hi] = parsed
      }
      if (!matchRange(lo, hi, form)) {
        return {
          isSkip: true,
          reason: `不匹配的薪资范围 ${text}, 预期: ${formatSalaryRange(form, salaryUnit, workDays)}`,
        }
      }
    }
  })

  companySizeRange = defineTaskHandler<C, T, S>('公司规模', (ctx) => {
    if (!ctx.helper.conf.formData.companySizeRange.enable) {
      return
    }
    return async (ctx, { jobData: data }) => {
      const text = data.brand.scale
      if (!rangeMatch(text, ctx.helper.conf.formData.companySizeRange.value)) {
        return taskResult.skip(
          `不匹配的公司规模 ${text}, 预期: ${rangeMatchFormat(ctx.helper.conf.formData.companySizeRange.value, '人')}`,
        )
      }
    }
  })
  jobContent = defineTaskHandler<C, T, S>('工作内容', (ctx) => {
    if (!ctx.helper.conf.formData.jobContent.enable) {
      return
    }
    return async (ctx, { jobData }) => {
      const content = jobData.jobDescription.toLowerCase()
      for (const x of ctx.helper.conf.formData.jobContent.value) {
        if (!x) {
          continue
        }
        // 关键词需转义后再拼正则, 否则 'C++' / '.NET' / '(' 等会导致误匹配或 RegExp 抛异常
        const escaped = x.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(`(?<!(不|无).{0,5})${escaped}(?!系统|软件|工具|服务)`)
        if (content != null && re.test(content)) {
          if (ctx.helper.conf.formData.jobContent.include) {
            return
          }
          return {
            isSkip: true,
            reason: `工作内容含有排除关键词 [${x}]`,
          }
        }
      }
      if (ctx.helper.conf.formData.jobContent.include) {
        return taskResult.skip('工作内容中不包含关键词')
      }
    }
  })

  hrPosition = defineTaskHandler<C, T, S>('Hr职位', (ctx) => {
    if (!ctx.helper.conf.formData.hrPosition.enable) {
      return
    }
    return async (_, { jobData }) => {
      const content = jobData.boss.title
      for (const x of ctx.helper.conf.formData.hrPosition.value) {
        if (!x) {
          continue
        }
        if (content != null && content.trim() === x) {
          if (ctx.helper.conf.formData.hrPosition.include) {
            return
          }
          return {
            isSkip: true,
            reason: `Hr职位在黑名单中 ${content}`,
          }
        }
      }
      if (ctx.helper.conf.formData.hrPosition.include) {
        return taskResult.skip(`Hr职位不在白名单中: ${content}`)
      }
    }
  })

  jobAddress = defineTaskHandler<C, T, S>('工作地址', (ctx) => {
    if (!ctx.helper.conf.formData.jobAddress.enable) {
      return
    }
    return async (_, { jobData }) => {
      if (ctx.helper.conf.formData.jobAddress.value.length === 0 || !jobData.address) {
        return
      }
      const content = jobData.address.toLowerCase()
      for (const x of ctx.helper.conf.formData.jobAddress.value) {
        if (!x) {
          continue
        }
        if (content.includes(x.toLowerCase())) {
          if (ctx.helper.conf.formData.jobAddress.include) {
            return
          }
          return {
            isSkip: true,
            reason: `工作地址含有排除关键词 [${x}]`,
          }
        }
      }
      // 仅包含模式下, 未命中任何关键词才跳过
      if (ctx.helper.conf.formData.jobAddress.include) {
        return {
          isSkip: true,
          reason: `工作地址不包含关键词: ${content}`,
        }
      }
    }
  })

  jobFriendStatus = defineTaskHandler<C, T, S>('好友状态', (ctx) => {
    if (!ctx.helper.conf.formData.friendStatus.value) {
      return
    }
    return async (_, { jobData }) => {
      if (jobData.boss?.isFriend === true) {
        return {
          isSkip: true,
          reason: '已经是好友了',
        }
      }
    }
  })

  activityFilter = defineTaskHandler<C, T, S>('活跃度过滤', (ctx) => {
    if (!ctx.helper.conf.formData.activityFilter.value) {
      return
    }
    return async (_, { jobData }) => {
      const activeText = jobData.activeTimeStr
      const activeTime = jobData.activeTime
      // 允许 2 个月内的活跃，超过则跳过
      if (activeTime) {
        const twoMonths = 2 * 30 * 24 * 60 * 60 * 1000
        if (ctx.now.getTime() - activeTime > twoMonths) {
          return taskResult.skip(`不活跃 [${new Date(activeTime).toLocaleString()}]`)
        }
        return
      }
      // 无时间戳时回退文本判断
      if (!activeText) {
        return taskResult.skip(`无活跃内容,如果全失败请反馈`)
      }
      if (activeText.includes('年')) {
        return taskResult.skip(`不活跃, [${activeText}]`)
      }
      const monthMatch = activeText.match(/(\d+)\s*个月/)
      if (monthMatch && Number(monthMatch[1]) > 2) {
        return taskResult.skip(`不活跃, [${activeText}]`)
      }
    }
  })

  amap = defineTaskHandler<C, T, S>('高德地图', (ctx) => {
    if (!ctx.helper.conf.formData.amap.enable) {
      return
    }
    return async (ctx, { jobData, state }) => {
      state.amap ??= {}

      if (!jobData.address) {
        return taskResult.skip('地址信息为空')
      }
      state.amap.geocode = await amapGeocode(jobData.address) // TODO: 直接使用经纬度
      if (!state.amap.geocode?.location) {
        return taskResult.skip('未获取到地址经纬度')
      }
      state.amap.distance = await amapDistance(state.amap.geocode.location)

      if (state.amap == null || state.amap.distance == null) {
        return {
          isSkip: true,
          reason: 'api数据异常',
        }
      }
      return [
        amapHandler(
          ctx,
          '直线',
          ctx.helper.conf.formData.amap.straightDistance,
          0,
          state.amap.distance.straight,
        ),
        amapHandler(
          ctx,
          '驾车',
          ctx.helper.conf.formData.amap.drivingDistance,
          ctx.helper.conf.formData.amap.drivingDuration,
          state.amap.distance.driving,
        ),
        amapHandler(
          ctx,
          '步行',
          ctx.helper.conf.formData.amap.walkingDistance,
          ctx.helper.conf.formData.amap.walkingDuration,
          state.amap.distance.walking,
        ),
      ]
    }
  })
}
