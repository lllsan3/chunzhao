# Supabase 维护 Runbook（2026-04-10）

## 适用范围

这份 runbook 用于记录 `chunzhao` 当前共享 Supabase 项目的真实维护状态，以及接下来应该如何安全推进数据库、邀请码 RPC 与存储清理。

项目信息：

- 项目：`chunzhao`
- 仓库：当前仓库根目录
- Supabase 项目：`zuorqnyxteftxtjrriox`

协作边界：

- 数据库写操作由人工在 Supabase Dashboard SQL Editor 执行
- Codex 负责生成 SQL、核实数据库状态、验证前端展示、更新文档或代码

## 与 runbook 一起入仓库的最小文件集

这份 runbook 不应该单独提交。至少应和下面这些可执行产物一起入仓库，否则后续接手人只能看到结论，拿不到直接可执行的文件：

- [`output/activation_codes_rls_fix.sql`](../output/activation_codes_rls_fix.sql)
- [`output/activation_codes_rpc_hardening.sql`](../output/activation_codes_rpc_hardening.sql)
- [`output/jobs_source_record_id_unique_index.sql`](../output/jobs_source_record_id_unique_index.sql)
- [`output/bigtech_tail_update.sql`](../output/bigtech_tail_update.sql)
- [`scripts/generate-offerstar-weekly-sql.mjs`](../scripts/generate-offerstar-weekly-sql.mjs)

如果希望保留这次 OfferStar 周更核查的证据链，建议再一起保留：

- [`output/offerstar_week_20260403_20260409.json`](../output/offerstar_week_20260403_20260409.json)
- [`output/offerstar_week_20260403_20260409_report.json`](../output/offerstar_week_20260403_20260409_report.json)

`output/offerstar_week_20260403_20260409_chunk_*.sql` 当前不属于必须随文档一起提交的最小集合，因为它们对应的记录已经全部入库，这批文件现在不应再执行，也不应再进入正式仓库资产。

## 已核实的当前事实

截至 `2026-04-10`，以下事实已经重新核实：

1. 前端 `npm run build` 可以通过。
2. `jobs` 表当前总数为 `24685`。
3. `jobs.source_record_id` 当前状态：
   - 非空重复组为 `0`
   - `NULL` 行数为 `503`
4. [`output/activation_codes_rls_fix.sql`](../output/activation_codes_rls_fix.sql) 已执行，`activation_codes` 的匿名直读表风险已压住。
5. [`output/jobs_source_record_id_unique_index.sql`](../output/jobs_source_record_id_unique_index.sql) 已执行，`jobs.source_record_id` 唯一索引已建立。
6. [`output/bigtech_tail_update.sql`](../output/bigtech_tail_update.sql) 已执行，`vivo` / `德勤` 的残留 `description` 已补齐。
7. `get_jobs_page(text, text, text, integer, integer)` 当前正常，返回的 `rows / total_count / filtered_count` 已复核。
8. `oqbj_chunk_0.sql` 到 `oqbj_chunk_15.sql` 中没有 `ON CONFLICT`，也没有 `WHERE NOT EXISTS`，且涉及的 `381` 个 `source_record_id` 当前都已存在于 `jobs` 表中。
9. `offerstar_week_20260403_20260409.json` 中的 `255` 个 `source_record_id` 当前也都已经存在于 `jobs` 表中。
10. 当前 `chunzhao` 代码里没有 Supabase Storage 的调用链路。
11. 当前最主要的系统性风险仍然是 `chunzhao` 和 `tingshuoyes` 共用同一个 Supabase 项目。

## Phase 1：邀请码 RPC 权限面审计结果

这一步的目标不是直接断言“现网一定在超暴露”，而是在共享项目中先把明显不该继续对公共客户端暴露的入口收掉。

已完成的代码侧审计：

1. `chunzhao` 当前可见前端代码里，只确认到：
   - `check_membership`
   - `redeem_code`

   没有发现直接调用 `activation_codes` 相关 RPC 的前端代码。

2. `tingshuoyes-practice` 当前可见前端代码里，注册页明确调用：
   - `verify_invitation_code(text)`

3. 当前可见历史迁移中存在以下 `activation_codes` 相关函数：
   - `verify_activation_code(text)`
   - `reserve_activation_code(text, text, text, jsonb)`
   - `release_activation_code(text, text)`
   - `finalize_activation_code(text, uuid, text)`
   - `verify_invitation_code(text)`
   - `use_invitation_code(text)`

4. 当前可见前端代码中，没有找到以下函数的直接调用痕迹：
   - `verify_activation_code`
   - `reserve_activation_code`
   - `release_activation_code`
   - `finalize_activation_code`
   - `use_invitation_code`

### 当前建议执行的 RPC 收紧 SQL

- [`output/activation_codes_rpc_hardening.sql`](../output/activation_codes_rpc_hardening.sql)

这份 SQL 做的事：

1. 保留 `verify_invitation_code(text)` 对 `anon` / `authenticated` 的执行权限
2. 撤销以下函数对 `PUBLIC` / `anon` / `authenticated` 的公共执行权限：
   - `verify_activation_code(text)`
   - `reserve_activation_code(text, text, text, jsonb)`
   - `release_activation_code(text, text)`
   - `finalize_activation_code(text, uuid, text)`
   - `use_invitation_code(text)`
3. 强化 `finalize_activation_code(...)`，要求 `auth.uid()` 与 `p_user_id` 一致
4. `finalize_activation_code(...)` 不再依赖可能缺失的 `normalize_activation_code(text)` helper
5. 删除仍存在的遗留 `use_invitation_code(text)` 函数
6. 如果共享项目里某些历史函数已经不存在，SQL 会自动跳过，而不是整段失败

执行前提：

- 先确认当前现网前端仍只依赖 `verify_invitation_code(text)`，没有隐藏链路在直接调用被撤权的函数。

## 现在该执行的事

按下面顺序推进：

1. 执行 [`output/activation_codes_rpc_hardening.sql`](../output/activation_codes_rpc_hardening.sql)
   原因：表级 RLS 已修，但共享项目里的邀请码 RPC 仍需要最小权限收紧。

2. 本地备份 `dictation-audio`，确认文件可用后，再删除云端存储内容。

3. 所有数据库或存储操作完成后，验证前端页面：
   - `/jobs`
   - `/jobs/:id`
   - `/dashboard`

## 现在不要执行的事

以下内容在当前状态下不应该再执行：

1. `oqbj_chunk_0.sql` 到 `oqbj_chunk_15.sql`
   原因：这 `381` 条已经在库里，而且这些文件本身不幂等。

2. `2026-04-03` 到 `2026-04-09` 这一批 OfferStar 周更导入 SQL
   原因：对应 `255` 条已经全部在库里。

3. 把 [`output/bigtech_11_update.sql`](../output/bigtech_11_update.sql) 当成完整待执行任务
   原因：大部分内容已经补过了，现在只剩小尾巴，且补尾巴已改由 [`output/bigtech_tail_update.sql`](../output/bigtech_tail_update.sql) 完成。

## 需要后续继续维护的内容

以下内容仍需要后续继续维护：

1. 一个统一的职位库导入标准流
   需要保留：
   - SQL 生成脚本
   - 修复类 SQL
   - `*_report.json`

   需要逐步废弃：
   - 直接用 anon key 写库的旧脚本
   - 多份字段映射不一致的旧导入脚本
   - 把凭据硬编码到脚本里的做法

2. 入口文档与 runbook 的同步
   - `HANDOFF.md`
   - `AGENTS.md`
   - 本 runbook

3. 中低优先级代码债
   - `useApplications` 数据层统一
   - 未使用依赖清理

## Storage 清理结果

`dictation-audio` 已于 `2026-04-10` 完成清理，执行结果如下：

1. 已完整备份到本地：
   - `C:\Users\Lenovo\Desktop\supabase-storage-backups\zuorqnyxteftxtjrriox\dictation-audio-2026-04-10`
2. 本地备份文件数：
   - `46`
3. 本地备份总大小：
   - `844480431` bytes
   - 约 `805.36 MB`
4. 已使用 `ffprobe` 抽样验证前 5 个 mp3 可正常读取
5. 云端 `dictation-audio` 当前对象数：
   - `0`

说明：

- 当前判断这部分主要属于 `tingshuoyes`
- `chunzhao` 仓库里没有直接依赖这部分 Storage 的代码路径
- Supabase Dashboard 的 Usage 面板回落可作为人工补充复核项，但对象级清理已经完成

## 前端验证清单

执行数据库或存储变更后，至少验证这些位置：

1. [`src/pages/Jobs.tsx`](../src/pages/Jobs.tsx)
   检查新增或更新的岗位是否能被搜索、筛选和展示。

2. [`src/pages/JobDetail.tsx`](../src/pages/JobDetail.tsx)
   检查 `description`、`resume_tips`、`evaluation`、`risk_notes` 是否正确显示。

3. [`src/pages/Dashboard.tsx`](../src/pages/Dashboard.tsx)
   检查职位统计和概览数字是否仍然正常。

4. 构建验证
   执行 `npm run build`

5. Storage 清理后补充验证
   - `dictation-audio` 对象数应保持 `0`
   - 主流程页面不应出现资源相关报错

## 当前仓库里的剩余技术债

这些问题仍然存在，但不属于第一波阻断项：

1. 共享 Supabase 项目尚未拆分。
2. `dictation-audio` 的备份与清理仍需人工执行。
3. [`output/activation_codes_rpc_hardening.sql`](../output/activation_codes_rpc_hardening.sql) 仍待在 Dashboard 手动执行。

已在本轮收口的代码侧事项：

- [`src/hooks/useApplications.ts`](../src/hooks/useApplications.ts) 已收成共享 Provider / 统一数据层。
- [`package.json`](../package.json) 中未使用的 `@dnd-kit/sortable` 已移除。

## 长期目标

稳定的最终状态应该是：

1. `chunzhao` 和 `tingshuoyes` 不再共用同一个 Supabase 项目。
2. `chunzhao` 单独保留自己真正需要的表与 RPC：
   - `jobs`
   - `user_applications`
   - `redeem_codes`
   - 相关 RPC 与 Auth
3. 未来所有职位库导入都走同一条路径：
   - 原始数据输入
   - 生成 SQL 到 `output/`
   - 人工在 Dashboard 执行
   - 执行后做前端验证
