# 第一阶段验收记录

验收日期：2026-09-23。Windows，Node.js 24.19.0；依赖的精确版本见锁文件。

## 已执行

- Next.js 生产构建成功，包含静态首页/设置/Portfolio 及动态 Discover、Suburb、Property、Watchlist 路由。
- TypeScript strict 类型检查通过。
- 4 个自动化测试通过：利息/空置/运营成本现金流，全款情景，非法输入，备份格式与价格区间验证。
- 浏览器中验证 WA 筛选显示 3 个房源；TAS 显示空结果；Reset filters 恢复列表。
- Financials 默认样例显示 −$8,212/年；利率改成 0 后显示 $27,500/年。
- 在独立的本地测试 origin 中保存笔记、勾选租金评估、添加 timeline、改成 Purchased；刷新并完成 hydration 后全部保留。
- Purchased 房源出现在 Portfolio，样例 asking total 为 $720,000。
- 390 × 844 手机尺寸查看 Portfolio、Overview；页面没有整体水平溢出，菜单可展开并跳转，地图可切换 Rockingham 并缩放。桌面样式也进行了视觉检查。
- 已观察的浏览器交互流程未出现 console error / warning。

## 手动复测步骤

1. Overview → 地图选择区域 → Explore suburb → 打开房源。
2. Discover 搜索地址、改变州、排序、应用 Buy Box，检查空结果。
3. Property 的五个 tab 可切换、URL 可分享；非法 property ID 显示 404。
4. Financials 改价格/租金/利率/空置，确认结果同步变化；空输入显示提示。
5. Watchlist 改阶段，检查 Overview 计数及 Timeline，Purchased 进入 Portfolio。
6. Research 添加笔记与勾选，刷新页面确认仍在。
7. Settings 修改预算并保存，Discover 勾选 Apply my Buy Box 生效。
8. 导出 JSON，先另存当前 workspace，再恢复备份；非法备份应保留原状态。
9. Ask AI 弹窗只给出明确标记的固定 checklist；Escape 可关闭。
10. 390px、768px 和桌面尺寸复测导航、表格滚动、表单和弹窗。

当前自动化测试覆盖业务纯函数与数据格式；尚未建立持续运行的浏览器 E2E 测试套件，也未进行真实 API、数据库、身份认证或多用户压力测试，因为这些功能不在本阶段内。

最终路由检查：7 个主要页面返回 HTTP 200，未知 Property / Suburb ID 返回 HTTP 404。全局助手的固定演示回复和关闭操作也已在浏览器中验证。
