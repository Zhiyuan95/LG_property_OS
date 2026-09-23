# Property OS

可自行维护的澳大利亚投资房研究 App 源码。React + Next.js App Router + TypeScript，Node.js runtime。

当前为 **公共区域数据 + OpenAI 研究版（0.2）**。Discover 默认读取 ABS 官方 Data API；Ask AI 通过服务端调用 OpenAI Responses API，需要用户自己的 API key。单套房源、租金、风险评分和 suburb 示例仍是 mock，界面明确区分。没有登录或多人协作。页面延续原稿，维护文档使用中文。

### 本次升级的使用入口

本次运行于 http://127.0.0.1:3002 ，因为 3000 已被旧服务占用。在 Settings → Data & AI connections 输入 API key 并保存，然后打开区域详情并点击 Ask AI。不要在聊天、代码或源码压缩包里放密钥。保存 key 不发起收费调用；发送研究问题会产生 OpenAI API 用量。

如果要保留旧版 3000 端口里的研究笔记，请先在旧版 Settings 导出 JSON，再在 3002 的 Settings 恢复。同一浏览器的不同端口使用不同 localStorage。

ABS 接入范围、来源质量标记、AI 连接及错误排查见 [数据与 AI 接入说明](docs/live-integrations.md)。

## 本地运行

安装 Node.js 22 或更新的受支持版本，以及 pnpm 10.17.1。首次安装依赖需要网络。

```sh
# 如果尚未安装 pnpm
npm install -g pnpm@10.17.1

# 在本项目目录中
pnpm install --frozen-lockfile
pnpm dev
```

浏览器打开 http://127.0.0.1:3000 。按 Ctrl+C 停止。

```sh
pnpm build          # 生产编译，同时进行 TypeScript 检查
pnpm start          # 启动已经编译的生产版本
pnpm typecheck      # 单独检查类型
pnpm test           # 财务公式和备份格式验证
pnpm format         # 统一代码格式
pnpm format:check   # 只检查格式
```

项目包含 `pnpm-lock.yaml`，请保留并提交。依赖版本以锁文件为准。也可以使用 npm install / npm run dev，但请在团队内统一包管理器并重新生成、维护对应的锁文件。Next.js 的运行要求见 [官方安装文档](https://nextjs.org/docs/app/getting-started/installation)。

公共 ABS 数据无需 key。OpenAI key 可在本地 Settings 保存至 `.env.local`，也可手动复制 `.env.example` 为 `.env.local` 并填写 `OPENAI_API_KEY` / `OPENAI_MODEL` 后重启。默认模型 `gpt-5-mini`，可改成账户支持且兼容 Responses structured output 的模型。`PROPERTY_DATA_PROVIDER=mock` 仅控制单套房源；公共区域数据走独立 ABS adapter，失败不会回退到 mock。

## 页面与交互

| 页面                 | 功能                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Overview             | Buy Box、待处理示例变化、动态 pipeline 计数、继续研究入口、地图、研究机会                |
| Discover             | 搜索地址/区域、州筛选、应用 Buy Box、价格/收益率/评分排序、地图/列表切换、加入 Watchlist |
| Suburb Intelligence  | 区域指标、待验证问题、区域内房源，位于 Discover 下                                       |
| Property Detail      | Overview / Financials / Market / Risks / Research；独立可链接的路由和 tab 参数           |
| Watchlist + Timeline | Watching → Researching → Inspect → Offer → Rejected / Purchased；状态变更记入时间线      |
| Portfolio            | 汇总标记为 Purchased 的房源，初始为空；金额明确是示例 asking price 而非真实资产估值      |
| Settings             | 修改称呼和 Buy Box；JSON 导出/恢复；重置演示状态；连接状态说明                           |

全局地址搜索会跳转至示例房源列表；Discover 的 Public regional data 提供公共区域搜索。Ask AI 按钮和 Ctrl/Cmd+K 打开真实模型入口，使用当前区域公开数据和来源标记作为证据，返回回答、待核实项及来源卡片。未配置 key 时明确提示，不再生成固定回复。风险、财务试算、AI 都没有独立一级导航。

研究笔记、清单勾选、投资阶段、手动 Timeline、用户设置保存于当前浏览器的 localStorage。备份入口位于 Settings。切换浏览器、端口或设备不会自动同步；多人/跨设备持久化属于下一阶段。多个标签页不要同时编辑同一个本地 workspace，以最后保存的内容为准。

财务试算参数为临时情景，切换离开 Financials 后恢复默认值，界面中已说明。

## 视觉参考

主要参考用户上传的 `Property Investment OS – 1 · Overview.html`，而非生成一套新视觉体系：

- 保留 #F4F2EC 米白背景、#15181D 深色侧栏、#0E5E5B 墨绿操作色及克制的边框/圆角。
- 保留 Instrument Serif 标题、IBM Plex Sans 正文和 IBM Plex Mono 数值字体。
- 保留问候区、Buy Box、Attention + Pipeline 双栏、地图、机会卡片的顺序和“Why now / What could I be wrong about?”结构。
- 字体和地图从用户上传 HTML 中提取为本地静态资源，无需访问 Google Fonts 或地图服务。
- 将原稿固定宽高改为响应式布局；小屏显示折叠菜单，表格可横向滚动。

为避免误导，“Live map / scanned today”改为明确的 sample snapshot。地图支持区域选择及缩放，使用原稿轮廓；没有真实地块、瓦片、地理编码或拖拽平移。原稿冗余的 Buy Box 一级导航合并至 Settings。Overview 的计数来自本地状态，但提醒与机会是固定样本。

## 代码结构

```text
src/
  app/                       Next.js 路由、布局和错误状态
    discover/
      suburb/[id]/           区域详情
      property/[id]/         房源详情
    watchlist/ portfolio/ settings/
    globals.css              设计变量、组件样式和响应式断点
    fonts.css                原稿字体的本地引用
  components/
    shell.tsx                侧栏、全局搜索、助手弹窗
    store.tsx                浏览器状态和持久化操作边界
    overview.tsx             首页
    discover.tsx             搜索筛选和列表
    australia-map.tsx        可选择区域的示例地图
    property-detail.tsx      房源模块及研究记录
    financials.tsx           试算表单
    watchlist.tsx            阶段和活动
    portfolio.tsx settings.tsx ui.tsx
  lib/
    types.ts                 领域类型
    repository.ts            仅服务端的数据访问接口及 provider 选择
    mock.ts                  确定性样本数据
    finance.ts               纯函数财务模型
    user-state.ts            本地数据版本、初始值、导入验证
tests/finance.test.ts         公式边界及数据导入检查
public/fonts/                原稿本地字体
public/australia.svg          原稿地图轮廓
docs/architecture.md          数据提供商、数据库和 AI 的扩展路径
docs/acceptance.md            验收记录及人工复测步骤
```

## 常见维护任务

1. **修改示例数据**：编辑 `src/lib/mock.ts`。房源的 `suburbId` 必须对应 suburb；保持稳定 ID，用户 Watchlist 通过 ID 关联。
2. **修改默认 Buy Box**：编辑 `initialState.preferences`。已存在的 localStorage 不会被自动覆盖，在 Settings 重置后才会采用新默认值。
3. **修改视觉**：优先调整 `globals.css` 顶部变量；布局断点位于文件底部。共享结构使用 `ui.tsx`，不要复制整页 HTML。
4. **新增阶段/字段**：同时更新 `types.ts`、状态验证、界面和备份兼容方案。当前备份 `version: 1`，不要无迁移地改变格式。
5. **更新依赖**：单独分支执行 `pnpm update`，检查 release notes，再执行 typecheck、test、build 和主要流程验收。锁文件需一起提交。
6. **迁移用户数据**：Settings 导出 JSON，在新浏览器恢复。恢复会覆盖当前本地 workspace；先导出旧数据。

## 财务口径

当前为 interest-only、税前现金流：

```text
loan = price × (1 − depositPercent / 100)
annualRent = weeklyRent × (52 − vacancyWeeks)
annualInterest = loan × interestRate / 100
annualCashflow = annualRent − annualInterest − annualCosts
weeklyCashflow = annualCashflow / 52
grossYield = weeklyRent × 52 / price × 100
```

年度运营成本由用户合并填入保险、管理、维护、rates 等；不计算本金摊还、印花税/购置费用、税、折旧或资本增值。负数是资金缺口。默认 Smith 样例算得约 −$158/周，使用统一公式，不照搬原 UX 无完整假设的 −$112/周。

## 当前边界

已接入 ABS 区域成交统计和 OpenAI 服务端研究接口。尚无实时单套挂牌、租金/空置率/风险图层 API、定时后台任务、身份认证或数据库。ABS 缓存为单进程内存，重启后重新获取；研究对话目前不保存历史。模型不会浏览网页、联系中介或执行交易。评分仍为示例，风险未验证，Portfolio 尚无真实租约/成本台账。首次真实 OpenAI 成功调用取决于用户配置有效 key、API 额度与模型权限。

这是本地单用户研究原型，不是可以直接开放给公众的多租户系统。要上线真实数据版本，先按 `docs/architecture.md` 接入鉴权、持久化、数据来源和授权，再部署 Node.js 服务。
