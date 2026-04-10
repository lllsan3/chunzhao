-- 用途：给 jobs.source_record_id 补真实唯一性约束，支持现有导入 SQL 的幂等去重思路
-- 当前检查结果：
-- 1. jobs 总数 24685
-- 2. source_record_id 为 NULL 的 503 条
-- 3. source_record_id 非空重复组 0 条
-- Postgres 唯一索引允许多个 NULL，因此可以直接执行。

CREATE UNIQUE INDEX IF NOT EXISTS jobs_source_record_id_uniq_idx
ON public.jobs (source_record_id);
