-- 用途：修复 public.activation_codes 未开启 RLS 的安全告警
-- 背景：当前仓库里没有找到 activation_codes 的直接调用，推测它是共享库中的内部表或历史遗留表。
-- 效果：开启 RLS 后，anon / authenticated 默认将无法直接读写该表；service_role 仍可访问。
-- 执行前请确认：tingshuoyes 或其他共享项目没有前端直接查询这张表。

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

