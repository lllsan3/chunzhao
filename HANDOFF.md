# 校招助手 — 项目交接文档

> 最后更新：2026-04-10
> 项目目录：仓库根目录
> 线上地址：[https://chunzhao.vercel.app](https://chunzhao.vercel.app)
> GitHub：[https://github.com/lllsan3/chunzhao](https://github.com/lllsan3/chunzhao)

---

## 一、项目概述

校招助手是一个面向大学生的校招岗位管理工具。主链路是：

`职位库浏览 -> 导入个人申请池 -> 看板管理投递进度 -> 详情页补充笔记与提醒 -> Dashboard 复盘`

当前商业模式：
- 免费版限 `3` 个岗位
- `9.9` 元终身完整版，通过兑换码激活

---

## 二、技术栈

- 前端：React 19 + TypeScript + Vite 8
- 样式：Tailwind CSS 4
- 路由：React Router v7
- 拖拽：`@dnd-kit/core`
- 图标：`lucide-react`
- 后端：Supabase（PostgreSQL + Auth + Realtime + RPC）
- 部署：Vercel（`push master` 自动部署）

---

## 三、页面与功能结构

### 路由

- `/` → Home
- `/login` → Login
- `/jobs` → Jobs
- `/jobs/:jobId` → JobDetail
- `/board` → Board
- `/dashboard` → Dashboard
- `/pricing` → Pricing
- `/exam` → Exam
- `/profile` → Profile
- `/applications/:applicationId` → ApplicationDetail

### 当前核心功能

- 邮箱注册 / 登录
- 职位库浏览、搜索、筛选、分页
- 岗位导入 / 移除
- 看板拖拽与手动添加
- 申请详情页的状态、笔记、提醒
- Dashboard 进度概览与导出卡
- 兑换码会员系统
- 移动端底部导航与移动端优先版式

---

## 四、设计系统

### 首页
- `Editorial Design`
- 米灰纸张底色：`bg-[#F4F4F0]`
- 衬线体标题、强画幅感、克制黑色 CTA

### 工具页
- `Information Design`
- 纸张底色：`bg-[#F9F9F6]`
- 白底、细边框、`shadow-none`
- 移动端优先，列表和卡片尽量压薄

硬规则：
- 所有用户文案必须中文
- 移动端改动优先用 `md:` 做隔离
- 不要把工具页改回厚卡片 SaaS 风格

---

## 五、Supabase 当前真实状态

### 项目信息

- Project URL：`https://zuorqnyxteftxtjrriox.supabase.co`
- Region：`us-east-1`
- 当前仍与 `tingshuoyes` 共用同一个 Supabase 项目

### 当前已确认的数据库状态

- `jobs` 当前总数：`24685`
- `jobs.source_record_id`：
  - 非空重复组：`0`
  - `NULL`：`503`
- `activation_codes`：RLS 已开启，匿名直读表风险已压住
- `jobs.source_record_id` 唯一索引已补
- `bigtech_tail_update.sql` 已执行，`vivo` / `德勤` 的残留描述已补齐
- `get_jobs_page` 数据库函数当前正常

### 当前最大的系统性风险

不是前端代码本身，而是共享 Supabase 项目带来的耦合：

1. 安全问题会跨项目串扰
2. Storage 配额会被旧项目资源拖累
3. 某些历史表 / RPC / bucket 是否还在用，不容易直接判断

数据库维护细节请以：
- [docs/supabase-maintenance-runbook-2026-04-10.md](./docs/supabase-maintenance-runbook-2026-04-10.md)

为准。

长期拆分方案见：
- [docs/supabase-split-migration-plan-2026-04-10.md](./docs/supabase-split-migration-plan-2026-04-10.md)

---

## 六、现在明确不要再执行的事

这些是已经核实过、当前不应再做的动作：

1. 不要再执行 `output/oqbj_chunk_0~15.sql`
   原因：这 `381` 条已全部在库里，而且这些 SQL 本身不幂等。

2. 不要再把 `output/bigtech_11_update.sql` 当成完整待执行任务
   原因：这批数据已经大部分补过，补尾巴已改由 `output/bigtech_tail_update.sql` 完成。

3. 不要再重复导入 `2026-04-03` 到 `2026-04-09` 的 OfferStar 周更 SQL
   原因：对应 `255` 条 `source_record_id` 已全部在库中。

4. 不要再把直接用 anon key 写库的旧脚本当成正式导入方案

---

## 七、当前应该继续推进的事

按优先级：

1. 审计并收紧共享项目的邀请码 RPC 权限面
2. 备份并清理 `dictation-audio`
3. 固化职位库唯一导入标准
4. 继续更新入口文档，避免下一位被旧待办误导
5. 清理中低优先级代码债

---

## 八、职位库导入标准

后续职位库更新统一按这条路径走：

1. 原始数据输入
2. 生成 `output/*.sql`
3. 人工在 Supabase Dashboard SQL Editor 执行
4. 执行后验证前端页面

建议保留的正式产物：
- SQL 生成脚本
- 修复类 SQL
- `*_report.json`

建议逐步废弃：
- 直接用 anon key 写库的旧脚本
- 多套重复的历史导入脚本
- 已确认不该再执行的旧 chunk SQL

---

## 九、前端数据层现状

### 已确认正常

- `/jobs` 列表与 `get_jobs_page` 当前正常
- `/jobs/:jobId` 职位详情正常
- `/dashboard` 的职位统计源正常
- `npm run build` 可通过

### 当前代码债

1. `src/hooks/useApplications.ts`
   需要维持成统一的数据层，避免多实例状态漂移

2. `package.json`
   无用依赖需要继续清理

3. 文档入口
   `HANDOFF.md`、`AGENTS.md` 和 runbook 必须保持同步，避免再把旧 SQL 写成待执行任务

---

## 十、关键文件

| 文件 | 用途 |
|------|------|
| `src/App.tsx` | 路由与全局布局 |
| `src/hooks/useApplications.ts` | 申请池共享数据层 |
| `src/hooks/useJobs.ts` | 职位库 RPC 查询 |
| `src/hooks/useSubscription.ts` | 会员状态与兑换 |
| `src/contexts/AuthContext.tsx` | Auth Provider |
| `src/pages/Jobs.tsx` | 职位库页面 |
| `src/pages/JobDetail.tsx` | 职位详情 |
| `src/pages/Board.tsx` | 看板 |
| `src/pages/Dashboard.tsx` | 进度概览 |
| `docs/supabase-maintenance-runbook-2026-04-10.md` | 数据库维护主 runbook |

---

## 十一、验证清单

数据库或导入相关变更后，至少验证：

1. `/jobs`
2. `/jobs/:jobId`
3. `/dashboard`
4. `npm run build`

如果涉及职位详情补充，还要验证：
- `description`
- `resume_tips`
- `evaluation`
- `risk_notes`

---

## 十二、长期目标

最终应该把 `chunzhao` 从共享 Supabase 项目中拆出来，单独保留：

- `jobs`
- `user_applications`
- `redeem_codes`
- 相关 RPC
- Auth

只要这一步没做完，安全告警、Storage 配额和历史遗留资源就还会互相牵连。
