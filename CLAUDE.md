# 校招助手 (chunzhao)

## 项目上下文
校招岗位管理工具。React 19 + Vite + Tailwind 4 + Supabase。
详细交接文档与数据库维护入口：
- [HANDOFF.md](./HANDOFF.md)
- [docs/supabase-maintenance-runbook-2026-04-10.md](./docs/supabase-maintenance-runbook-2026-04-10.md)

## 关键命令
- `npm run dev` — 开发服务器
- `npm run build` — 生产构建（TypeScript 严格模式）
- `git push` — 自动部署到 Vercel

## 绝对规则
- 所有用户文案用中文
- 首页用 Editorial Design 杂志风（font-editorial 衬线体、bg-[#F4F4F0]）
- 工具页用 Information Design（无阴影、border border-gray-200、slate 色系）
- 移动端改动用响应式前缀（md:），不破坏桌面端
- Supabase RPC 用参数化查询，不用动态 SQL
- 乐观更新：所有 mutation 先更新本地 state，API 失败后 rollback
- 免费用户限制 3 个岗位（服务端触发器 + 前端双重检查）
- 数据库写操作默认由人工在 Supabase Dashboard 执行，仓库内主要提交 SQL、文档与前端代码

## 当前真实状态
- `activation_codes` 表的匿名直读风险已通过 RLS 压住
- `jobs.source_record_id` 唯一索引已建立
- `bigtech_tail_update.sql` 已执行，`vivo` / `德勤` 残留描述已补齐
- `get_jobs_page` 数据库函数当前正常
- `chunzhao` 与 `tingshuoyes` 仍共用同一个 Supabase 项目，这是当前最大的系统性风险

## 现在应该做什么
1. 按 runbook 审计并收紧共享项目的邀请码 RPC 权限面
2. 备份并清理共享项目里的 `dictation-audio`
3. 维持职位库唯一导入标准：原始数据 → 生成 `output/*.sql` → Dashboard 手动执行 → 前端验证

## 明确不要再做的事
- 不要再执行 `output/oqbj_chunk_0~15.sql`
- 不要再把 `output/bigtech_11_update.sql` 当成完整待执行任务
- 不要再重复导入 `output/offerstar_week_20260403_20260409.json` 对应的那批周更 SQL
