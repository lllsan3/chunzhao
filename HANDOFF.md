# 校招助手 — 项目交接文档

> 最后更新: 2026-04-04
> 项目目录: C:\Users\Lenovo\Desktop\chunzhao
> 线上地址: https://chunzhao.vercel.app
> GitHub: https://github.com/lllsan3/chunzhao

---

## 一、项目概述

校招助手是一个面向大学生的校招岗位管理工具。核心功能：浏览 24000+ 校招岗位 → 一键导入个人申请池 → 看板式管理投递进度 → 提醒与笔记。

**商业模式**: 免费版限 3 个岗位，9.9 元终身完整版（通过兑换码激活）。

---

## 二、技术栈

- 前端: React 19 + TypeScript + Vite 8
- 样式: Tailwind CSS 4（@theme 变量在 src/index.css）
- 路由: React Router v7
- 拖拽: @dnd-kit/core
- 图标: lucide-react
- 后端: Supabase (PostgreSQL + Auth + Realtime + RPC)
- 部署: Vercel（push master 自动部署）

---

## 三、Supabase 项目信息

- Project URL: https://zuorqnyxteftxtjrriox.supabase.co
- Region: us-east-1（RTT 200-400ms 到中国）
- Anon Key: 在 .env.local 中
- 注意: 此 Supabase 项目与英语沉浸学习平台（tingshuoyes）共用

### 数据库表

| 表 | 用途 | 行数 | RLS |
|---|------|------|-----|
| jobs | 职位库 | 24430 | anon+authenticated SELECT |
| user_applications | 用户申请池 | 按用户 | authenticated ALL where user_id=auth.uid() |
| redeem_codes | 兑换码 | 99未用+1已用 | authenticated SELECT where used_by=auth.uid() |

### 关键 RPC 函数

- get_jobs_page(p_quick_tag, p_search, p_company_type, p_offset, p_limit) — 职位库分页+筛选+计数
- get_job_stats() — 进度概览的职位库统计
- redeem_code(p_code) — 原子性兑换码验证
- check_membership() — 检查用户是否为付费会员
- check_application_limit() — BEFORE INSERT 触发器，免费用户限 3 条

---

## 四、前端架构

### 路由 (App.tsx)

- / → Home（Editorial Design 落地页）
- /login → Login
- /jobs → Jobs（职位库）
- /jobs/:jobId → JobDetail
- /board → Board（ProtectedRoute + BoardPreview fallback）
- /dashboard → Dashboard（ProtectedRoute）
- /pricing → Pricing
- /exam → Exam
- /profile → Profile（移动端"我的"）
- /applications/:id → ApplicationDetail（ProtectedRoute）

### 导航

- 桌面端: 顶部 Navbar（透明背景 Editorial 风格）
- 移动端: 底部 BottomNav（4 tab）+ 顶部仅 logo+铃铛

### 核心 Hooks

- useAuth → contexts/AuthContext.tsx（单例 Provider）
- useApplications → 申请 CRUD + Realtime + 乐观更新
- useJobs → 职位库 RPC 查询 + 缓存
- useSubscription → 会员状态 + 兑换
- useSEO → 动态 meta tags

### 缓存 (lib/queryCache.ts)

Module-level Map，stale-while-revalidate。默认 60s，会员状态 300s。

### 乐观更新 (useApplications)

- importJob: 先创建乐观记录(crypto.randomUUID) → API → 失败时 rollback
- deleteApplication: 先移除 → API → 失败时恢复
- Realtime INSERT handler 有去重

### 预加载 (lib/prefetch.ts)

Navbar "找职位" onMouseEnter 预加载 Jobs RPC 数据。

---

## 五、设计规范

### 两套设计语言

1. **首页 = Editorial Design**（数字杂志风）
   - 背景: bg-[#F4F4F0]（米灰纸张色）
   - 大标题: font-editorial（衬线体）
   - 按钮: rounded-md，深色实心
   - 链接: underline underline-offset-[6px] + hover 渐变
   - 三列: 不对称 grid + 中间列 mt-12 错落 + border-x 分割线

2. **工具页 = Information Design**（极致紧凑）
   - 背景: bg-[#F9F9F6]
   - 卡片: bg-white rounded-md border border-gray-200 shadow-none
   - 移动端: px-3 py-2.5 极限压缩
   - 岗位: chipified text-[10px]，middot 分隔元数据
   - 筛选器: 无边框透明下拉

### 颜色变量 (index.css @theme)

- --color-brand: #18243d（主按钮）
- --color-accent: #3563ff（链接/激活态）
- --color-ink: #1f2a3d（正文）
- --color-ink-muted: #6b7a90（次要文字）

---

## 六、已完成功能

### 核心
- 邮箱注册/登录（验证已关闭，注册后自动登录）
- 职位库 24430 条（RPC 分页+筛选+3 个快捷标签）
- 导入/移除切换（乐观更新，按钮即时变化）
- 看板拖拽（桌面）+ tab 切换（移动）
- 手动添加职位 + 删除
- 申请详情（状态/笔记自动保存/提醒）
- 进度概览（8 状态计数 + 职位库数据看板 + 城市分布柱状图）
- 职位详情（4 字段详情 + 导入 CTA + 相关推荐）

### 付费
- 免费版 3 岗位限制（服务端触发器）
- 兑换码系统（原子性 RPC）
- 定价页两档 + 兑换弹窗
- PaywallModal

### 移动端
- 底部导航栏 4 tab
- "我的"个人中心页
- 看板未登录预览（BoardPreview）
- 职位库极致紧凑卡片
- 看板 Editorial text tabs
- 登录页表单上移

### 性能
- Code splitting（首屏 75KB gzip）
- 单 RPC 合并查询
- queryCache + Navbar hover prefetch
- Realtime 订阅
- 数据库索引

### 安全
- RLS 全覆盖
- 服务端免费限制
- redirect 校验
- 环境变量校验

### SEO
- sitemap.xml + robots.txt
- 动态 meta tags + canonical

---

## 七、待办任务

### 需要数据库操作（在 Supabase Dashboard SQL Editor 执行）

1. **offerqingbaoju 381 条新数据**
   - SQL 文件: output/oqbj_chunk_0.sql 到 oqbj_chunk_15.sql
   - 每个 25 条 INSERT，ON CONFLICT DO NOTHING

### 代码优化

1. useApplications 应提升为 Context（消除多实例 Realtime channel）
2. @dnd-kit/sortable 包可删除（未使用）
3. ApplicationDetail 笔记保存 toast 改为 inline 状态（已做但可再验证）

### 设计优化

1. ApplicationDetail 页面 Editorial 风格重构
2. 定价页移动端优化
3. 笔试真题页 Editorial 风格

---

## 八、展示账号

- 邮箱: 1471523495@qq.com
- 状态: 终身会员
- 数据: 12 条精选（腾讯Offer/字节面试/蚂蚁面试/小红书笔试/招行笔试/美团已投/快手已投/百度已投/京东待投/国网待投/华为待投/滴滴已拒）

---

## 九、关键文件

| 文件 | 用途 |
|------|------|
| src/App.tsx | 路由 + 全局布局 |
| src/index.css | 颜色/字体变量 |
| src/lib/constants.ts | 状态常量 |
| src/lib/supabase.ts | Supabase 客户端 |
| src/lib/queryCache.ts | 缓存系统 |
| src/contexts/AuthContext.tsx | Auth Provider |
| src/components/BottomNav.tsx | 移动端底部导航 |
| src/components/BoardPreview.tsx | 看板未登录预览 |
| src/components/ProtectedRoute.tsx | 路由保护（支持 fallback） |
| docs/mobile-optimization-prd.md | 移动端优化 PRD |

---

## 十、注意事项

1. 数据库写操作需要 Supabase MCP 或 Dashboard SQL Editor（anon key 只能 SELECT）
2. 不要修改 AuthContext/ProtectedRoute 的 auth 逻辑
3. 所有用户文案必须中文
4. 移动端改动通过 md: 断点隔离，不影响桌面端
5. 首页用 Editorial Design，工具页用 Information Design
6. 每次改动: npm run build → git push → Vercel 自动部署
7. Supabase 在美国，尽量减少请求数，善用缓存
