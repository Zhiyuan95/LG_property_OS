# 数据与扩展设计

版本 0.2 已实现 ABS 区域数据和 OpenAI 研究。新增 `public-data.ts` DTO、`abs-parser.ts` 元数据解析、`abs-client.ts` 缓存、`research.ts` 模型服务及 `/api/regions`、`/api/research`、`/api/connections`。详细现状见 `live-integrations.md`。下述 PropertyRepository 和数据库规划仍适用于尚未接入的单套真实房源。

## 现有边界

Server Components → `getRepository(): PropertyRepository` → mock adapter → serializable typed DTO → client components。

`repository.ts` 使用 Next.js `server-only` 边界。API token、数据库连接串、供应商查询逻辑只能位于服务端。客户端只接收需要展示的字段。当前同步规模仅 8 个房源，不能将“全量 snapshot 发到浏览器”的方式直接扩展到全国真实数据。

浏览器状态通过 `Store` 的 `update` / `setStage` 集中修改。`UserState.version` 与 `isUserState` 在读取及恢复时验证格式；恢复不执行输入中的脚本。未来替换为鉴权后的服务端 mutations，并保留乐观更新/错误提示。

## Domain / PropTrack / ABS / 州政府数据

实施新的 `PropertyRepository` adapter，保留页面 DTO，逐步把 `snapshot()` 拆成分页 `searchProperties(filters, cursor)`、区域聚合和单房源详情查询。不要把 provider 名称写进 UI 组件。

推荐每条观测记录携带 provider、原始记录 ID、采集时间、有效时间、许可范围、置信度和 stale 状态。现有 `Provenance` 为刻意严格的 mock 类型；真实接入时扩展为可判别联合类型，并更新展示，禁止把真实/估计/模拟混在一个不透明字段里。

域模型应分开 property（物理资产）和 listing（挂牌），避免地址作为唯一 ID。市场快照、租金估计和风险图层分别版本化。州政府 GIS 结果必须进行 parcel 匹配并说明图层日期和空间精度；空响应应显示 unknown，不能推断为 safe。

离线 ingestion job 负责限速、重试、去重、供应商状态和增量更新。服务端缓存已有观测，UI 展示来源和最后更新时间；失败时保留过期标记，不能伪造最新数据。

## PostgreSQL / PostGIS

建议在真正接入时引入迁移工具，而不是预先塞入无法运行的 ORM：

| 表                      | 关键字段与职责                                           |
| ----------------------- | -------------------------------------------------------- |
| users / workspaces      | 身份和数据所有权                                         |
| suburbs                 | 稳定 ID、州、postcode、polygon geometry、人口观测引用    |
| properties              | 稳定资产 ID、标准化地址、geometry(Point,4326)、parcel ID |
| listings                | provider/listing ID、资产 ID、挂牌状态、价格和租金观测   |
| observations            | 数值/结构化结果、来源、置信度、有效时间、采集时间        |
| watchlist_entries       | workspace、property、stage、乐观锁 version               |
| timeline_events         | immutable event ID、事件时间、来源、actor、payload       |
| research_notes / checks | workspace、property、内容、修改时间                      |
| preferences / scenarios | 用户 Buy Box、独立保存的财务假设版本                     |

为 geometry 加 GiST index，地址与 provider ID 建唯一/检索索引；空间筛选放在数据库中。鉴权应在每次查询和 mutation 验证 workspace 权限，配合事务和租户隔离，不能仅依赖前端隐藏。

## AI agent

`research-assistant.tsx` 已调用服务端 `/api/research`：输入问题及可选 region/property ID；服务端取得 ABS 证据并调用 OpenAI Responses API，输出结论、引用/观测 ID、未知项、创建时间、模型和 token 用量。示例 property context 明确标为虚构。尚未实现自主工具执行、多轮历史或数据库保存。

Agent 只能通过服务层读取规范化数据；工具输出和网页内容都不可信。为工具白名单、超时、费用、请求频率和工作区权限设限制。将对外联系、订阅数据、创建支出和任何买卖操作与研究回答分开并显式授权。研究结果不可自动把风险从 unknown 改成 verified，除非有可追溯证据和清晰审核规则。

## 部署顺序

1. 先把本地状态迁移为 authenticated workspace 数据，保留 JSON 导出。
2. 加入实际 Postgres 迁移及数据库备份/恢复测试。
3. 接入一个获许可的 listing provider、最小区域范围、错误和过期状态。
4. 加来源、审计和风险图层，再加入带引用的研究 agent。
5. 完成鉴权、限流、日志脱敏、监控和持久化存储后，部署 `next build` / `next start` 的 Node.js 服务。

不需要 Vercel 才能运行此项目；当前源码不是静态 HTML 导出，动态路由需要 Node.js runtime。
