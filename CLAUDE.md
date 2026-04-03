# 校招助手 (chunzhao)

## 项目上下文
校招岗位管理工具。React 19 + Vite + Tailwind 4 + Supabase。
**详细交接文档见 [HANDOFF.md](./HANDOFF.md)**——包含完整的技术架构、数据库状态、已完成功能、待办任务和设计规范。

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

## 待执行任务
1. 执行 `output/bigtech_11_update.sql`（11 家大厂详情 UPDATE）
2. 执行 `output/oqbj_chunk_0~15.sql`（381 条新职位 INSERT）
3. 验证大厂实习覆盖率达到 95%+
