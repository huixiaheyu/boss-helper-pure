<script lang="ts" setup>
import { computed } from 'vue'

import { formInfoData, useConf } from '@/composables/conf'

const conf = useConf()
const toast = useToast()

const amapGeocodeLoading = ref(false)

// 启用地址筛选后锁定参数输入, 防止投递运行中被误改; 需先取消启用才能编辑
const addrDisabled = computed(() => conf.formData.amap.enable)

async function amapGeocodeHandler() {
  const amapKey = conf.formData.amap.key
  if (!amapKey) {
    toast.add({
      title: '请先填写高德地图 key',
      color: 'warning',
    })
    return
  }
  amapGeocodeLoading.value = true
  try {
    const res = await amapGeocode(conf.formData.amap.origins)
    if (res) {
      conf.formData.amap.origins = res.location
    } else {
      toast.add({
        title: '获取地址失败: 未匹配到该地址的经纬度，请尝试填写更完整的地址',
        color: 'error',
      })
    }
  } catch (error) {
    toast.add({
      title: `获取地址失败: ${errorHandle(error)}`,
      color: 'error',
    })
    logger.error(error)
  } finally {
    amapGeocodeLoading.value = false
  }
}

</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-2 gap-2">
      <UFormField v-bind="formInfoData.amap.enable">
        <UCheckbox v-model="conf.formData.amap.enable" />
      </UFormField>
      <UFormField :data-help="formInfoData.amap.key['data-help']" :title="formInfoData.amap.key['data-help']">
        <template #label>
          <a
            href="https://lbs.amap.com/api/webservice/guide/create-project/get-key"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 hover:underline hover:text-(--accent)"
            title="点击查看如何获取高德地图 key"
          >
            {{ formInfoData.amap.key.label }}
          </a>
        </template>
        <UInput
          v-model="conf.formData.amap.key"
          :disabled="addrDisabled"
          :ui="{
            root: 'w-70',
            base: 'disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed',
          }"
        />
      </UFormField>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <UFormField v-bind="formInfoData.amap.origins">
        <UFieldGroup>
          <UInput
            v-model="conf.formData.amap.origins"
            :disabled="addrDisabled || amapGeocodeLoading"
            class="w-56"
            placeholder="可输入地址，点击右侧按钮转换"
          />
          <UButton
            color="primary"
            :disabled="addrDisabled"
            :loading="amapGeocodeLoading"
            @click="amapGeocodeHandler()"
            icon="solar:magnifer-bug-outline"
            title="根据完整地址获取经纬度"
          >
          </UButton>
        </UFieldGroup>
      </UFormField>
      <UFormField v-bind="formInfoData.amap.straightDistance">
        <UFieldGroup>
          <UInputNumber
            v-model="conf.formData.amap.straightDistance"
            :precision="1"
            :max="1000"
            :min="0"
            :step="1"
            :disabled="addrDisabled"
          />
          <UBadge label="km" />
        </UFieldGroup>
      </UFormField>

      <UFormField v-bind="formInfoData.amap.drivingDistance">
        <UFieldGroup>
          <UInputNumber
            v-model="conf.formData.amap.drivingDistance"
            :precision="1"
            :max="1000"
            :min="0"
            :step="1"
            :disabled="addrDisabled"
          />
          <UBadge label="km" />
        </UFieldGroup>
      </UFormField>
      <UFormField v-bind="formInfoData.amap.drivingDuration">
        <UFieldGroup>
          <UInputNumber
            v-model="conf.formData.amap.drivingDuration"
            :precision="2"
            :max="1440"
            :min="0"
            :step="30"
            :disabled="addrDisabled"
          />

          <UBadge label="分钟" />
        </UFieldGroup>
      </UFormField>

      <UFormField v-bind="formInfoData.amap.walkingDistance">
        <UFieldGroup>
          <UInputNumber
            v-model="conf.formData.amap.walkingDistance"
            :precision="1"
            :max="1000"
            :min="0"
            :step="1"
            :disabled="addrDisabled"
          />
          <UBadge label="km" />
        </UFieldGroup>
      </UFormField>
      <UFormField v-bind="formInfoData.amap.walkingDuration">
        <UFieldGroup>
          <UInputNumber
            v-model="conf.formData.amap.walkingDuration"
            :precision="2"
            :max="1440"
            :min="0"
            :step="30"
            :disabled="addrDisabled"
          />
          <UBadge label="分钟" />
        </UFieldGroup>
      </UFormField>
    </div>
  </div>
</template>
