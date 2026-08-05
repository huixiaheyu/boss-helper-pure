# 纯净版 Boss直聘助手

> [!CAUTION]
> 本项目仅供学习交流，禁止用于商业用途
>
> 使用该脚本有一定风险(如黑号,封号,权重降低等)，本项目不承担任何责任

基于 boss-helper 项目精简定制的**纯净版**：移除 AI、公告、辅助 UI 等非核心功能，专注**批量投递 + 高级筛选 + 自定义招呼语**，体验更轻量简洁。

技术栈：WXT + Vue3 + NuxtUI@4 + TailwindCSS@4

## 纯净版移除了什么

### 1. AI 功能
- 删除 AI 组件：AI 招呼/筛选/回复、AI 对话面板
- 删除模型管理（多模型配置）
- 移除投递流程中 AI 筛选 / AI 招呼任务
- 移除相关依赖（`ai`、`@ai-sdk/openai` 等）

### 2. 公告 / 联网配置
- 删除公告横幅、反馈按钮、版本检查

### 3. 辅助 UI（纯净化界面）
- 横栏：删除「关于&赞赏」「帮助」、版本号按钮
- 配置面板：删除招呼语配置、外观配置、顶部提示卡片
- 配置级别强制为「高级」模式

## 纯净版保留的能力

- 批量投递简历
- 高级筛选（薪资 / 公司 / 岗位 / 内容 / 地址距离等）
- 自定义招呼语（模板变量）
- 投递日志

## 使用

1. 安装依赖：`bun install`
2. 开发模式：`npm run dev`
3. 构建打包：
   - `npm run build:chrome` — 打包 Chrome
   - `npm run build:firefox` — 打包 Firefox
   - `npm run build:edge` — 打包 Edge
   - `npm run build` — 打包全部浏览器
   - `npm run zip` — 生成各浏览器 zip 包

构建产物输出到 `output/` 目录。

## 隐私政策

本扩展不自动收集任何个人信息。

我们收集/处理的数据：

- 用户自愿保存的招聘平台 Cookie：仅用于账号切换功能，本地 storage 保存，不上传、不共享。
- 用户自愿保存的投递记录、日志等数据：仅保存在浏览器本地，用于投递统计与筛选功能。

数据不用于其他目的，不出售、不分享给第三方。

用户控制：

- 可随时在扩展选项中删除/修改相关数据。
- 卸载扩展即删除所有本地数据。

无其他浏览活动收集。扩展仅在 zhipin.com 域名注入脚本。

## 鸣谢

- <https://github.com/yangfeng20/boss_batch_push>
- <https://github.com/lisonge/vite-plugin-monkey>
- <https://github.com/chatanywhere/GPT_API_free>
- <https://uiverse.io/>
- <https://www.runoob.com/manual/mqtt/protocol/MQTT-3.1.1-CN.pdf>

## 类似项目

- <https://github.com/Frrrrrrrrank/auto_job__find__chatgpt__rpa>
- <https://github.com/noBaldAaa/find-job>
