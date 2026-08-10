<template>
  <div class="p-2 flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <div class="serif-title text-lg leading-none" style="color: var(--accent)">
        boss-helper-pure
      </div>
      <div class="mono-label text-sm">纯净版 · 求职助手 · 批量投递</div>
    </div>

    <div class="flex flex-col gap-1">
      <div class="mono-label text-xs opacity-60">项目简介</div>
      <p class="text-sm leading-relaxed">
        基于 boss-helper 精简定制的纯净版扩展，移除 AI、招呼语、公告等非核心功能，专注
        <b>批量投递简历 + 高级筛选</b>，体验更轻量简洁。
      </p>
    </div>

    <UAlert
      title="本项目仅供学习交流，禁止用于商业用途。使用脚本存在一定风险(如黑号、封号、权重降低等)，本项目不承担任何责任。"
      color="warning"
      :close="false"
    />

    <div class="flex flex-col gap-1">
      <div class="mono-label text-xs opacity-60">作者寄语</div>
      <p class="text-sm leading-relaxed italic" style="color: var(--ink-soft)">
        打工只是过渡，当老板才是终极目标。祝愿所有人拨开迷雾，早日上岸，自在从容。
      </p>
    </div>
  </div>
</template>
