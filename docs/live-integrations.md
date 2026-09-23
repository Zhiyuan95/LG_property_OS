# 公共区域数据与 OpenAI 接入（0.2）

## 已连接的数据

`GET /api/regions` 从 ABS Data API 读取 `RES_DWELL`：15 个首府都市圈/州内其他地区、最近 8 个季度、4 个指标。当前验证取得 480 条记录，最新季度 2026-Q2。

指标为 established house / attached dwelling 成交中位价及成交数量。它们不是单套房源、挂牌价、租金、vacancy、suburb 中位价，也不是排除成交结构变化后的资本增值指数。`UNIT_MULT=3` 的金额乘以 1,000 后才展示 AUD。

来源：[ABS Data API 说明](https://www.abs.gov.au/statistics/application-programming-interfaces-apis/data-api-user-guide)、[SDMX 数据结构](https://www.abs.gov.au/statistics/application-programming-interfaces-apis/data-api-user-guide/understanding-sdmx-data)。

必须保留的来源质量信息：这次 API 返回 `meta.test=true`、`NonProductionDataflow=true`，最新观测也可能标记 preliminary。App 展示这些标记，AI prompt 同样包含它们。应与 ABS 正式统计发布交叉核对，不能把响应包装成已核实的生产估值数据。这里的“已连接”表示实际调用 ABS 接口成功，不代表移除了 API 本身的 Beta/数据质量限制。

查询在服务端固定，用户无法注入任意 URL。20 秒超时、6 小时单进程缓存、并发合并；手动刷新最多每分钟访问一次上游。上游失败时可显示 7 天以内的旧快照，并标为 stale；完全没有数据时返回 503，不代入样例数字。缓存不跨进程持久化。

## OpenAI

1. 启动本地服务，进入 Settings → Data & AI connections。
2. 输入自己的 OpenAI project key，默认模型为 `gpt-5-mini`，点击 Save local connection。
3. 保存只把 key 写入项目 `.env.local` 并更新当前进程，不发起收费调用。其他已运行的服务进程需重启后才能读取文件中的更改。
4. 进入 Discover 的某个区域，点击 Ask AI 并发送问题。请求会把问题和公开 ABS 证据送至 OpenAI；不会自动发送私人笔记、Watchlist 或浏览器备份。
5. 核对答案、引用卡片、未核实事项及来源质量提示。没有 key 或调用失败时展示错误，绝不退回固定演示答案。

使用 [Responses API](https://developers.openai.com/api/docs/quickstart) 和 JSON schema structured output。默认 [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini) 可由 `OPENAI_MODEL` 配置；所选模型需支持该 API/输出格式。key 和账单权限由用户自己的 OpenAI project 提供。

当前实现：60 秒超时、最多 3,000 输出 token、最多 2 个并发请求、每个服务进程每小时 20 次请求。限额重启即重置，不是账户级硬预算。API 使用 `store:false`；这不等同于服务商零留存承诺。答案目前是单次问答，不保存聊天历史；未实现 web search 或 autonomous agent。

返回字段包括 answer、openQuestions、sources、model、generatedAt 和 token 用量。引用 ID 必须属于送入模型的证据，否则该次回答失败。源 URL 由服务端生成，避免模型自行提供来源链接。数字和建议仍需人工核对，引用存在不等于论证正确。

## 本地安全边界

- 服务绑定 loopback。写配置和调用模型的接口要求本机 Host 和严格匹配的 Origin；不采用 X-Forwarded-Host。
- key 以明文存在本机 `.env.local`，不是 OS 密钥库。不要把此文件分享、提交或打包；Windows 文件权限沿用工作区权限。
- 前端不返回密钥；设置接口只返回是否已配置及模型名。失败消息不返回供应商原始响应或 Authorization。
- 源码 ZIP 与工作区 JSON 备份均不包含密钥。
- 该阶段没有登录及多租户隔离。不要直接改为 `0.0.0.0` 并公开部署。远程部署前需替换本机配置接口、增加鉴权、持久化限流与数据库。

## 主要文件

| 文件                                    | 职责                                                |
| --------------------------------------- | --------------------------------------------------- |
| `src/lib/public-data.ts`                | 独立于 mock 的公共数据 DTO、固定 ABS 查询和地域映射 |
| `src/lib/abs-parser.ts`                 | 按 SDMX 元数据解析索引、单位、空值及质量标记        |
| `src/lib/abs-client.ts`                 | ABS HTTP、缓存、超时与 stale fallback               |
| `src/lib/research.ts`                   | 证据组装、OpenAI 请求、输出/来源验证与限流          |
| `src/lib/openai-config.ts`              | 本机密钥配置；临时文件后原子替换                    |
| `src/lib/local-api.ts`                  | 同源检查及请求体大小限制                            |
| `src/components/public-market.tsx`      | 区域列表、历史季度、来源说明                        |
| `src/components/research-assistant.tsx` | 真实 AI 表单、等待/错误和证据卡片                   |
| `src/components/connections.tsx`        | Settings 连接配置                                   |
| `tests/abs.test.ts`                     | 单位、空值、异常元数据、同源及大小限制测试          |

## 验证与排错

已通过生产构建、strict TypeScript、10 项本地测试及真实 ABS HTTP 调用。已验证无 key 时模型接口返回 503，跨站 Origin 返回 403。未经用户配置有效 key，不宣称完成付费模型的成功调用验证。

- ABS 503：点击 Refresh；检查到 `data.api.abs.gov.au` 的网络连接。失败期间不会显示伪造数据。
- 模型 503：在当前服务的 Settings 保存 key；换进程启动时需从正确项目目录运行。
- OpenAI 401/403：检查 project key 与模型访问权限。
- OpenAI 429：检查 API 项目余额/限额，或稍后重试。
- 本地 403：使用同一个 localhost 或 127.0.0.1 地址访问，不混用端口或绕过本机限制。
- 地址已占用：使用 `pnpm exec next start --hostname 127.0.0.1 --port 3002`。

下一步再接获授权的 Domain/PropTrack 单套房源、ABS suburb/SA2 人口指标、风险 GIS、Postgres/PostGIS 及账户体系。
