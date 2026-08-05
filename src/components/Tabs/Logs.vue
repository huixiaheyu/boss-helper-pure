<script lang="tsx" setup>
import { reactive, ref } from 'vue'

import JobCard from '@/components/JobCard.vue'
import { TableColumn } from '@nuxt/ui'
import { useHelper,Log } from '@/composables/useHelper'
const helper = useHelper()

// const { filterData, dialogData } = useLog()

const dialogData = reactive<{ show: boolean; data?: Log }>({ show: false })

const columns: TableColumn<Log>[] = [
  {
    accessorKey: 'title',
    header: '标题',
    cell: ({ row }) => (
      <UButton
        onClick={() => {
          dialogData.show = true
          dialogData.data = row.original
        }}
      >
        {row.getValue('title')}
      </UButton>
    ),
  },
  {
    accessorKey: 'state',
    header: '内容',
    cell: ({ row }) => (
      <div class="flex items-center gap-2">
        <UBadge color={row.original.state ?? 'primary'}>{row.original.state_name}</UBadge>
        {row.original.message && (
          <span class="truncate text-xs text-foreground/70">{row.original.message}</span>
        )}
      </div>
    ),
    // headerCellRenderer: (props: HeaderCellRendererParams<log>) => {
    //   return (
    //     <div class="flex items-center justify-center">
    //       <span class="mr-2 text-xs">{props.column.title}</span>
    //       <ElPopover trigger="click" {...{ width: 200 }}>
    //         {{
    //           default: () => (
    //             <div class="filter-wrapper">
    //               <ElCheckboxGroup v-model={filterStatus.value}>
    //                 {stateNames.map((item) => (
    //                   <ElCheckbox value={item[1]}>
    //                     <ElTag type={item[0]}>{item[1]}</ElTag>
    //                   </ElCheckbox>
    //                 ))}
    //               </ElCheckboxGroup>
    //               <div class="el-table-v2__demo-filter">
    //                 <ElButton
    //                   text
    //                   onClick={() => {
    //                     filterStatus.value = stateNames
    //                       .map((item) => item[1])
    //                       .filter((status) => !filterStatus.value.includes(status))
    //                   }}
    //                 >
    //                   反选
    //                 </ElButton>
    //               </div>
    //             </div>
    //           ),
    //           reference: () => (
    //             <ElIcon class="cursor-pointer">
    //               <svg
    //                 class="icon"
    //                 viewBox="0 0 1024 1024"
    //                 version="1.1"
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 p-id="2612"
    //                 width="200"
    //                 height="200"
    //               >
    //                 <path
    //                   d="M608.241895 960.010751c-17.717453 0-31.994625-14.277171-31.994625-31.994625l0-479.919368c0-7.912649 2.92424-15.653284 8.256677-21.501764l208.82513-234.455233L230.498908 192.139761l209.169158 234.627247c5.160423 5.84848 8.084663 13.417101 8.084663 21.32975l0 288.811692 50.916177 41.111372c13.761129 11.180917 15.825298 31.306568 4.816395 45.067697s-31.306568 15.825298-45.067697 4.816395L395.632454 776.815723c-7.568621-6.020494-11.868974-15.309256-11.868974-24.942046L383.763481 460.137746 135.203091 181.302873c-8.428691-9.460776-10.492861-22.877877-5.332437-34.402822 5.160423-11.524945 16.685369-18.921552 29.242399-18.921552l706.289938 0c12.729044 0 24.081975 7.396607 29.242399 19.093566 5.160423 11.524945 2.92424 25.11406-5.504452 34.402822L640.236519 460.30976l0 467.706367C640.236519 945.73358 625.959348 960.010751 608.241895 960.010751z"
    //                   fill="#575B66"
    //                   p-id="2613"
    //                 ></path>
    //               </svg>
    //             </ElIcon>
    //           ),
    //         }}
    //       </ElPopover>
    //     </div>
    //   )
    // },
  },
  // {
  //   accessorKey: 'message',
  //   header: '信息',
  //   // width: 360,
  //   // minWidth: 360,
  //   // align: 'left',
  // },
]

// TODO: 自动滚动底部
// watchEffect(() => {
//   tableRef.value?.scrollToRow(data.value.length - 1);
// });
</script>

<template>
  <div class="flex items-center justify-between">
    <h1>投递日志</h1>
    <UButton size="xs" color="neutral" variant="subtle" @click="helper.logs.clear()">
      清空日志
    </UButton>
  </div>
  <UTable ref="tableRef" :columns="columns" :data="helper.logs.value" :height="300" />
  <UModal v-model:open="dialogData.show" title="日志详情">
    <template #body>
      <div class="log-detail">
        <div class="log-detail-left">
          <JobCard v-if="dialogData.data?.job" :job="dialogData.data.job" />
        </div>
        <div class="log-detail-right">
          <template v-if="dialogData.data">
            <div>
              <UBadge :color="dialogData.data.state ?? 'primary'">
                {{ dialogData.data.state_name }}
              </UBadge>
            </div>
            <div v-if="dialogData.data.message" class="mt-2 text-sm">
              {{ dialogData.data.message }}
            </div>
            <div v-if="dialogData.data?.data?.err" class="mt-2 text-sm">
              {{ dialogData.data.data.err }}
            </div>
            <div v-if="dialogData.data?.data?.message" class="mt-2 text-sm">
              {{ dialogData.data.data.message }}
            </div>
          </template>
        </div>
      </div>
    </template>
    <template #footer>
      <UButton @click="dialogData.show = false"> 关闭 </UButton>
    </template>
  </UModal>
</template>

<style lang="scss">
.ehp-table-v2__row-depth-0 {
  height: 50px;
}

.ehp-table-v2__cell-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-detail {
  display: flex;
  gap: 20px;
  min-height: 500px;

  &-left {
    flex: 0 0 350px;
  }

  &-right {
    flex: 1;
    overflow-y: auto;
  }
}

.log-section {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;

  h4 {
    margin: 0 0 12px;
    color: #606266;
  }
}

.ai-qa {
  .ai-q {
    color: #606266;
    margin-bottom: 8px;
  }
  .ai-a {
    color: #303133;
    white-space: pre-wrap;
  }
}

.ai-text {
  white-space: pre-wrap;
  user-select: text;
  padding: 8px;
  line-height: 1.5;
}

.ehp-collapse-item.active {
  .ehp-collapse-item__header {
    border-bottom-color: transparent;
  }
}
</style>
