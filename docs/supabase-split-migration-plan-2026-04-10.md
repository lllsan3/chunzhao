# Supabase 拆分迁移方案（2026-04-10）

## Summary

这份文档用于把 `chunzhao` 从当前共享 Supabase 项目 `zuorqnyxteftxtjrriox` 中独立出来。

本轮不直接切换生产环境，只产出一份可执行迁移方案，目标是：

1. 新建独立 Supabase 项目承载 `chunzhao`
2. 迁移 `chunzhao` 真正依赖的表、索引、RLS、RPC 与 Auth
3. 完成一次可回滚的环境切换

## 迁移范围

### 必迁对象

- `public.jobs`
- `public.user_applications`
- `public.redeem_codes`
- `public.activation_codes` 仅在 `chunzhao` 仍需要共享邀请码能力时再决定是否迁移
- `auth.users`
- `get_jobs_page`
- `get_job_stats`
- `redeem_code`
- `check_membership`
- 免费用户限制相关触发器与函数
- 与申请池读写相关的 RLS、索引、Realtime 依赖

### 不迁对象

- `dictation-audio`
- `tingshuoyes` 独有表
- `tingshuoyes` 独有邀请码或文章相关函数
- 当前共享项目中的历史遗留 bucket

## 迁移前提

1. 先确认 `chunzhao` 现网真正依赖的 RPC、触发器、索引清单
2. 先导出当前生产环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. 新项目准备完成后，再生成新的前端环境变量
4. 切换前必须保留旧项目回滚窗口

## 执行步骤

### Step 1：新建独立项目

在 Supabase 新建一个专门给 `chunzhao` 的项目，并记录：

- `project ref`
- `project url`
- `anon key`
- `service role key`
- 数据库连接信息

### Step 2：导出当前结构

从旧项目导出 `chunzhao` 所需 schema：

- 目标表结构
- 索引
- RLS policy
- 触发器
- RPC / function 定义

导出后的结构 SQL 要去掉：

- `tingshuoyes` 独有对象
- 已确认废弃的共享历史函数

### Step 3：在新项目重建结构

在新项目按顺序导入：

1. 表结构
2. 索引
3. 函数
4. 触发器
5. RLS policy

要求：

- `jobs.source_record_id` 唯一索引要保留
- `activation_codes` 若迁移，则默认带上当前已收紧后的权限策略
- 不把共享项目里无关 Storage 一起迁过来

### Step 4：导入数据

按这个顺序导入数据：

1. `jobs`
2. `redeem_codes`
3. `auth.users`
4. `user_applications`

导入后立即验证：

- `jobs` 总数
- `user_applications` 总数
- `redeem_codes` 状态分布
- 关键 RPC 是否能正常执行

### Step 5：切换前端环境变量

在本地与 Vercel 中切换到新项目：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

切换后先做预发布验证，不直接先删旧项目对象。

### Step 6：切换验证

至少验证这些页面与功能：

- `/jobs`
- `/jobs/:jobId`
- `/board`
- `/dashboard`
- 登录
- 兑换码
- 导入岗位
- 手动添加
- 更新状态 / 笔记 / 提醒

### Step 7：回滚策略

如果切换后出现阻断问题：

1. 立即恢复旧的前端环境变量
2. 重新部署 Vercel
3. 保留新项目数据，问题修完后再二次切换

## 验收标准

迁移完成后应满足：

1. `chunzhao` 不再依赖共享 Supabase 项目
2. `tingshuoyes` 的安全告警、Storage 配额、遗留对象不再影响 `chunzhao`
3. 主流程页面与写操作全部正常
4. 新项目中的 RLS、RPC、索引与当前生产能力一致

## 默认决策

- 本轮先产出迁移方案，不直接实施切换
- 默认不迁移与 `tingshuoyes` 独有业务相关的 Storage 和表
- 如果邀请码能力未来仍由 `chunzhao` 使用，则迁移时保留 `activation_codes`，否则不迁
