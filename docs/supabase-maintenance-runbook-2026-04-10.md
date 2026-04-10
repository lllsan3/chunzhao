# Supabase 维护 Runbook（2026-04-10）

## 适用范围

这份 runbook 用于记录 `chunzhao` 当前共享 Supabase 项目的真实维护状态，以及接下来应该如何安全推进数据库与存储清理。

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
- [`output/jobs_source_record_id_unique_index.sql`](../output/jobs_source_record_id_unique_index.sql)
- [`output/bigtech_tail_update.sql`](../output/bigtech_tail_update.sql)
- [`scripts/generate-offerstar-weekly-sql.mjs`](../scripts/generate-offerstar-weekly-sql.mjs)

如果希望保留这次 OfferStar 周更核查的证据链，建议再一起保留：

- [`output/offerstar_week_20260403_20260409.json`](../output/offerstar_week_20260403_20260409.json)
- [`output/offerstar_week_20260403_20260409_report.json`](../output/offerstar_week_20260403_20260409_report.json)

`output/offerstar_week_20260403_20260409_chunk_*.sql` 当前不属于必须随文档一起提交的最小集合，因为它们对应的记录已经全部入库，这批文件现在不应再执行。

## 已核实的当前事实

截至 `2026-04-10`，以下事实已经重新核实：

1. 前端 `npm run build` 可以通过。
2. `jobs` 表当前总数为 `24685`。
3. `jobs.source_record_id` 当前状态：
   - 非空重复组为 `0`
   - `NULL` 行数为 `503`
4. `activation_codes` 当前可以通过 anon key 直接读到数据，这是明确的安全风险。
5. `oqbj_chunk_0.sql` 到 `oqbj_chunk_15.sql` 中没有 `ON CONFLICT`，也没有 `WHERE NOT EXISTS`。
6. `oqbj_chunk_0.sql` 到 `oqbj_chunk_15.sql` 中涉及的 `381` 个 `source_record_id`，当前都已经存在于 `jobs` 表中。
7. `offerstar_week_20260403_20260409.json` 中的 `255` 个 `source_record_id`，当前也都已经存在于 `jobs` 表中。
8. `bigtech_11_update.sql` 已经不是“整包待执行”状态，目前只剩少量补尾巴：
   - `vivo`：还有 `1` 条缺少 `description`
   - `德勤`：还有 `1` 条缺少 `description`
   - `微软中国`：当前 `jobs` 表里没有命中的公司记录
9. 当前 `chunzhao` 代码里没有 Supabase Storage 的调用链路。
10. 当前最主要的系统性风险仍然是 `chunzhao` 和 `tingshuoyes` 共用同一个 Supabase 项目。

## 现在该执行的事

按下面顺序推进：

1. 执行 [`output/activation_codes_rls_fix.sql`](../output/activation_codes_rls_fix.sql)
   原因：`activation_codes` 当前匿名可读，属于明确线上风险。
   执行前提：先确认 `tingshuoyes` 或其他共享项目没有前端直接查询这张表；如果有，应该改成最小权限策略，而不是直接把前端访问链路封死。

2. 执行 [`output/jobs_source_record_id_unique_index.sql`](../output/jobs_source_record_id_unique_index.sql)
   原因：当前数据状态允许直接加唯一索引，能让后续职位库导入更稳定。

3. 执行 [`output/bigtech_tail_update.sql`](../output/bigtech_tail_update.sql)，不要再整包重复执行 [`output/bigtech_11_update.sql`](../output/bigtech_11_update.sql)。

4. 本地备份 `dictation-audio`，确认文件可用后，再删除云端存储内容。

5. 所有数据库或存储操作完成后，验证前端页面：
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
   原因：大部分内容已经补过了，现在只剩小尾巴。

## 需要后续继续维护的内容

以下内容仍需要后续继续维护：

1. 一个统一的职位库导入标准流
   需要保留：
   - SQL 生成脚本
   - `output/*.sql`
   - `*_report.json`

   需要逐步废弃：
   - 直接用 anon key 写库的旧脚本
   - 多份字段映射不一致的旧导入脚本
   - 把凭据硬编码到脚本里的做法

## Storage 清理顺序

针对 `dictation-audio`，按这个顺序处理：

1. 把 bucket 内容完整下载到本地归档目录。
2. 本地抽样确认文件可打开、可播放。
3. 删除云端 `dictation-audio` 内容。
4. 删除后重新检查 Supabase Usage 是否回落。

说明：

- 当前判断这部分主要属于 `tingshuoyes`
- `chunzhao` 仓库里没有直接依赖这部分 Storage 的代码路径

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

## 当前仓库里的已知技术债

这些问题是真实存在的，但不属于第一波阻断项：

1. [`src/hooks/useApplications.ts`](../src/hooks/useApplications.ts) 仍然是 hook 级实例，不是共享 Context。
2. [`package.json`](../package.json) 里还有 `@dnd-kit/sortable`，但当前仓库没有实际引用。
3. [`HANDOFF.md`](../HANDOFF.md) 里有几处结论已经过时：
   - RLS 全覆盖
   - 若干 SQL 仍待执行
   - 旧导入 SQL 可幂等执行

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
