> [!CAUTION]
> 本项目仅供学习交流，禁止用于商业用途
>
> 使用该脚本有一定风险(如黑号,封号,权重降低等)，本项目不承担任何责任

## 项目介绍

Boss直聘助手, 皆在减少投递简历的麻烦, 和提高投递简历的效率。技术栈使用 WXT + Vue3 + NuxtUI@4 + TailwindCSS@4。

本项目为个人自用/定制版本，基于开源项目裁剪定制，移除了 AI 等功能，仅保留核心的批量投递与筛选能力。

## 功能

- [x] 优化UI去除广告
- [x] 批量投递简历
- 高级筛选
  - [x] 薪资,公司名,工作名,人数,内容简单筛选
  - 公司地址相关
    > 使用高德api，需要自行申请，或者使用关键字筛选
    - [x] 驾车/步行距离
    - [x] 驾车/步行时间
  - [ ] 公司风险评控
- 自动打招呼
  - [x] 模板语言（自定义招呼语）
- 额外功能(有时间会写)
  - [x] 自适应UI适配手机
  - [ ] 黑名单
  - [ ] 聊天阻止发送已读
  - [ ] boss消息弹窗

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
