-- 用途：在 activation_codes 表已开启 RLS 的前提下，
--       继续收紧共享 Supabase 项目中邀请码相关 RPC 的公共权限面。
--
-- 审计依据（2026-04-10）：
-- 1. chunzhao 当前前端只确认使用 check_membership / redeem_code。
-- 2. tingshuoyes-practice 当前可见注册页只确认使用 verify_invitation_code(text)。
-- 3. 当前没有在可见前端代码中找到 reserve / release / finalize / use_invitation_code
--    或 verify_activation_code 的直接调用痕迹。
--
-- 执行前请确认：
-- - 当前现网前端仍只依赖 verify_invitation_code(text) 做邀请码校验。
-- - 若有隐藏链路仍直接调用下面将被撤权的函数，请先改客户端或改成服务端调用。

create or replace function public.finalize_activation_code(
  p_code text,
  p_user_id uuid,
  p_phone text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text := upper(left(regexp_replace(coalesce(trim(p_code), ''), '\s+', '', 'g'), 32));
  normalized_phone text := nullif(trim(p_phone), '');
  request_user_id uuid := auth.uid();
begin
  if normalized_code = '' or p_user_id is null then
    return false;
  end if;

  if request_user_id is null or request_user_id <> p_user_id then
    raise exception 'finalize_activation_code forbidden for current user'
      using errcode = '42501';
  end if;

  update public.activation_codes
  set used_at = now(),
      used_by = p_user_id,
      used_phone = coalesce(normalized_phone, used_phone),
      reserved_at = null,
      reserved_phone = null
  where code = normalized_code
    and used_at is null
    and (
      reserved_phone is null
      or reserved_phone = normalized_phone
      or reserved_at < now() - interval '30 minutes'
    );

  return found;
end;
$$;

do $$
begin
  if to_regprocedure('public.verify_activation_code(text)') is not null then
    execute 'revoke execute on function public.verify_activation_code(text) from public, anon, authenticated';
  end if;

  if to_regprocedure('public.reserve_activation_code(text, text, text, jsonb)') is not null then
    execute 'revoke execute on function public.reserve_activation_code(text, text, text, jsonb) from public, anon, authenticated';
  end if;

  if to_regprocedure('public.release_activation_code(text, text)') is not null then
    execute 'revoke execute on function public.release_activation_code(text, text) from public, anon, authenticated';
  end if;

  if to_regprocedure('public.finalize_activation_code(text, uuid, text)') is not null then
    execute 'revoke execute on function public.finalize_activation_code(text, uuid, text) from public, anon, authenticated';
  end if;

  if to_regprocedure('public.use_invitation_code(text)') is not null then
    execute 'revoke execute on function public.use_invitation_code(text) from public, anon, authenticated';
  end if;

  if to_regprocedure('public.verify_invitation_code(text)') is not null then
    execute 'revoke execute on function public.verify_invitation_code(text) from public';
    execute 'grant execute on function public.verify_invitation_code(text) to anon, authenticated';
  end if;
end
$$;

drop function if exists public.use_invitation_code(text);
