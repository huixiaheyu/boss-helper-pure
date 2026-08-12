<script lang="tsx" setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'

import JobCard from '@/components/JobCard.vue'
import { TableColumn } from '@nuxt/ui'
import { useHelper,Log } from '@/composables/useHelper'
const helper = useHelper()

// 日志滚动框自身，仅在其内部滚动，避免带动整个页面
const scrollBox = ref<HTMLElement>()

// 是否显示"可向上滑动查看更早日志"的底部渐变提示
const showMoreHint = ref(false)

function scrollToBottom() {
  const el = scrollBox.value
  if (el) el.scrollTop = el.scrollHeight
}

function updateMoreHint() {
  const el = scrollBox.value
  if (!el) return
  // 只有内容超出容器高度(可滚动)时才提示；滚到底部则隐藏
  const canScroll = el.scrollHeight > el.clientHeight + 4
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  showMoreHint.value = canScroll && !atBottom
}

// 日志更新时自动滚动到最新
watch(
  () => helper.logs.value.length,
  () => {
    void nextTick().then(() => {
      scrollToBottom()
      updateMoreHint()
    })
  },
)

// 初次挂载已有历史日志时滚到底
onMounted(() => {
  void nextTick().then(() => {
    scrollToBottom()
    updateMoreHint()
  })
})

const dialogData = reactive<{ show: boolean; data?: Log }>({ show: false })

const columns: TableColumn<Log>[] = [
  {
    accessorKey: 'title',
    header: '标题',
    size: 180,
    cell: ({ row }) => (
      <UButton
        variant="link"
        class="log-title-btn"
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
        <span class="log-state" data-state={row.original.state ?? 'primary'}>
          {row.original.state_name}
        </span>
        {row.original.message && (
          <span class="truncate text-xs opacity-60 mono-label">{row.original.message}</span>
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
]

</script>

<template>
  <div class="relative">
    <div
      ref="scrollBox"
      class="min-h-0 max-h-[500px] overflow-y-auto overflow-x-hidden border border-black/5 rounded-lg"
      @scroll="updateMoreHint"
    >
      <UTable
        sticky
        :columns="columns"
        :data="helper.logs.value"
        class="!my-0"
        :ui="{ thead: 'hidden', td: { base: 'py-1.5 px-2 leading-tight' } }"
      />
    </div>
    <transition name="fade">
      <div v-if="showMoreHint" class="log-more-hint">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3 h-3"
          viewBox="0 0 1024 1024"
        >
          <path
            fill="currentColor"
            d="M512 678.4 133.12 299.52a30.72 30.72 0 0 1 43.52-43.52L512 591.36l335.36-335.36a30.72 30.72 0 1 1 43.52 43.52L512 678.4z"
          />
        </svg>
        滑动查看更早的日志
      </div>
    </transition>
  </div>
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
/* 日志标题按钮（游戏化衬线风格） */
.log-title-btn {
  font-family: 'Instrument Serif', 'Iowan Old Style', Georgia, serif;
  font-style: italic;
  font-size: 0.98rem;
  color: var(--ink);
}

/* 日志状态标签（等宽 + 状态彩块） */
.log-state {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;

  &[data-state='success'] {
    color: #2e7d46;
    background: #cbe3d2;
  }
  &[data-state='info'] {
    color: #2a5f86;
    background: #d3e2ef;
  }
  &[data-state='warning'] {
    color: #9a6b12;
    background: #f4dfb6;
  }
  &[data-state='danger'] {
    color: #b03a2e;
    background: #f4c7b8;
  }
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

/* 底部渐变遮罩 + 滚动提示 */
.log-more-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 26px 0 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: var(--ink);
  pointer-events: none;
  background: linear-gradient(to top, var(--paper) 35%, rgba(255, 253, 249, 0) 100%);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  animation: logHintBounce 2.4s ease-in-out infinite;
}

@keyframes logHintBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
