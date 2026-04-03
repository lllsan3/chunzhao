# 校招助手 — 项目交接文档

> 最后更新：2026-04-04
> 用途：新 Claude Code 会话无缝续接工作的完整上下文

---

## 一、项目概况

**产品名称**：校招助手（原名"春招助手"，已全站改名）
**定位**：面向大学生的校招岗位管理工具，2 万 + 岗位免费浏览，一键导入看板追踪投递进度
**线上地址**：https://chunzhao.vercel.app（计划迁移到 offer123.cc）
**GitHub**：https://github.com/lllsan3/chunzhao (master 分支，push 即自动部署到 Vercel)

### 技术栈
- React 19 + TypeScript + Vite 8
- Tailwind CSS 4（@theme 变量在 index.css，无 tailwind.config.js）
- React Router v7（classic history mode）
- @dnd-kit/core（看板拖拽）
- Supabase：PostgreSQL + Auth + Realtime + RPC
- Supabase 项目 ID：`zuorqnyxteftxtjrriox`
- 部署：Vercel（GitHub push auto-deploy）

### 设计语言
- **首页**：Editorial Design 杂志风（衬线体 font-editorial、米灰底 #F4F4F0、非对称网格）
- **工具页**（职位库/看板/概览）：Information Design 信息流风格（无衬线体、极简卡片、shadow-none、border border-gray-200）
- **全局**：深海军蓝品牌色 #18243d（brand）、亮蓝 #3563ff（accent）、自定义色系在 index.css @theme 中

---

## 二、文件结构

```
src/
├── App.tsx                    # 路由 + BottomNav + AuthProvider + ProtectedRoute
├── main.tsx                   # 入口
├── index.css                  # Tailwind @theme 变量 + 全局字体栈 + font-editorial
├── contexts/
│   └── AuthContext.tsx         # 单例 Auth Provider（getUser + onAuthStateChange）
├── hooks/
│   ├── useAuth.ts             # 重导出 AuthContext（所有组件 import 这个）
│   ├── useApplications.ts     # CRUD user_applications + Realtime 订阅 + 乐观更新
│   ├── useJobs.ts             # 分页职位查询（get_jobs_page RPC + queryCache）
│   ├── useSubscription.ts     # 会员检测（check_membership RPC + 5min 缓存）
│   └── useSEO.ts              # 动态 title + meta description + canonical
├── lib/
│   ├── supabase.ts            # Supabase client + env 校验
│   ├── constants.ts           # STATUS_MAP/LIST/COLORS, COMPANY_TYPES
│   ├── queryCache.ts          # 模块级 Map 缓存（stale-while-revalidate）
│   ├── errorTracker.ts        # 按操作计数失败次数，2 次后显示统一消息
│   ├── prefetch.ts            # Navbar hover "找职位" 时预加载 get_jobs_page
│   ├── cityNormalize.ts       # 城市名归一化（去后缀、提取主城市）
│   └── time.ts                # timeAgo 相对时间
├── components/
│   ├── Layout/Navbar.tsx      # 顶部导航（桌面端完整，移动端仅 logo + bell）
│   ├── BottomNav.tsx          # 移动端底部 4-tab 导航（md:hidden）
│   ├── ProtectedRoute.tsx     # Auth 守卫（支持 fallback prop）
│   ├── BoardPreview.tsx       # 看板未登录预览（mock 数据 + 注册 CTA）
│   ├── Toast.tsx              # Toast 通知（5 秒，移动端 bottom-20）
│   ├── ConfirmDialog.tsx      # 共享确认弹窗
│   ├── PaywallModal.tsx       # 付费引导弹窗（兑换码输入）
│   └── StatusBadge.tsx        # 状态标签
└── pages/
    ├── Home.tsx               # 首页（Editorial Design 杂志风）
    ├── Jobs.tsx               # 职位库（24000+ 岗位，分页，标签筛选）
    ├── JobDetail.tsx          # 职位详情（description/tips/eval/risk + 相关推荐）
    ├── Board.tsx              # 我的投递/看板（桌面拖拽 + 移动端 tab 列表）
    ├── ApplicationDetail.tsx  # 申请详情（状态/笔记/提醒）
    ├── Dashboard.tsx          # 进度概览（8 卡片 + 职位库数据看板 + 城市柱状图）
    ├── Pricing.tsx            # 定价页（两档：免费 3 岗 / ¥9.9 完整版 + 兑换码）
    ├── Exam.tsx               # 笔试真题（10 条牛客链接）
    ├── Login.tsx              # 登录/注册（邮箱密码，错误中文化）
    └── Profile.tsx            # 我的（个人中心 + 菜单入口）
```

---

## 三、数据库状态（Supabase）

### 表结构

**jobs**（24,430 条）
- 核心字段：id, title, company, city, deadline, tags[], jd_url, status, company_type, target_graduates, recruitment_type, industry, source, source_record_id
- 详情字段：description, resume_tips, evaluation, risk_notes（3,086 条有值）
- RLS：anon + authenticated 均可 SELECT
- 索引：updated_at DESC, company_type, tags(GIN), source_record_id(UNIQUE partial)

**user_applications**（36 条，含展示账号 12 条）
- 核心字段：id, user_id, job_id(可空), title, company, city, deadline, jd_url, status, notes, reminder_date, reminder_note, source, imported_at, updated_at
- RLS：ALL policy, `user_id = auth.uid()`
- 触发器：`check_application_limit` — BEFORE INSERT 检查免费用户 ≤3 条
- Realtime：已启用（supabase_realtime publication）

**redeem_codes**（100 条，99 未用，1 已用）
- 字段：id, code(唯一), plan_type, expires_at, is_used, used_by, used_at
- RLS：authenticated SELECT where `used_by = auth.uid()`
- RPC：`redeem_code(p_code)` — 原子性校验 + 绑定
- RPC：`check_membership()` — 查当前用户是否有有效码

### 关键 RPC

- `get_jobs_page(p_quick_tag, p_search, p_company_type, p_offset, p_limit)` — 职位库分页（参数化查询，非动态 SQL）
- `get_job_stats()` — Dashboard 数据看板（总数/央企/大厂/本周新增/Top10 城市）
- `redeem_code(p_code)` — 兑换码验证
- `check_membership()` — 会员检查

### 用户
- 展示账号：`1471523495@qq.com`（已升级为 lifetime 会员，12 条精选申请数据）
- 总注册用户：20（含测试账号）

---

## 四、已完成功能

### 核心功能
- [x] 邮箱密码注册/登录（错误信息中文化，redirect 校验）
- [x] 职位库：24000+ 岗位，分页加载（36/页），搜索，城市/企业类型/快捷标签筛选
- [x] 导入/移除切换：点一次导入（乐观更新），再点确认移除
- [x] 看板：桌面端拖拽 8 列，移动端 text-flow tabs + 紧凑卡片
- [x] 手动添加职位（Board 页右上角）
- [x] 申请详情：状态管理、笔记自动保存（inline 状态指示）、提醒设置
- [x] 删除申请（Board 卡片 hover/移动端按钮 + 详情页底部）
- [x] 进度概览：8 状态卡片 + 职位库数据看板 + 城市柱状图 + 动态倒计时
- [x] 兑换码系统：redeem_codes 表 + RPC + Pricing 页兑换弹窗
- [x] 免费版限制：3 岗位上限（服务端触发器 + 前端 paywall 弹窗）
- [x] Supabase Realtime：INSERT/UPDATE/DELETE 实时同步
- [x] 404 页面、环境变量校验、ProtectedRoute + fallback

### 前端优化
- [x] Code splitting（React.lazy + Suspense，首屏 JS 从 152KB → 75KB gzip）
- [x] 查询合并（4 请求 → 1 RPC）
- [x] 模块级 queryCache（stale-while-revalidate，60s）
- [x] Navbar hover 预加载职位库数据
- [x] useSubscription 缓存 5 分钟
- [x] AuthContext 单例（替代每个组件独立 useAuth）
- [x] 乐观更新：导入/删除/状态变更均在 API 调用前更新 UI
- [x] Toast 5 秒停留，移动端 bottom-20

### 设计
- [x] 底部导航栏（4 tab：首页/职位库/看板/我的）
- [x] 首页 Editorial Design 杂志风（衬线体、非对称网格、报刊目录、微交互）
- [x] 职位库 Information Design（极限密度、chipified 岗位、middot 元数据、ghost 按钮）
- [x] 看板 Editorial Kanban（text-flow tabs、报纸分割线、compact cards）
- [x] 配色系统：@theme 变量 + font-editorial 衬线字体栈

### SEO
- [x] sitemap.xml（/, /jobs, /pricing, /exam）
- [x] robots.txt → sitemap
- [x] 每页 meta title + description + canonical（useSEO hook）
- [x] index.html viewport-fit=cover

---

## 五、进行中 / 未完成任务

### 数据补充
- **offerqingbaoju 381 条新数据**：已准备好 SQL（output/oqbj_chunk_*.sql，16 个文件），但未执行 INSERT。需要用 Supabase MCP `execute_sql` 逐批执行。
- **11 家大厂详情**：`output/bigtech_11_update.sql` 已准备好（阿里/拼多多/vivo/微软/小米/联想/蔚来/中兴/德勤/贝恩/小鹏），需要 `execute_sql` 执行 UPDATE。
- **大厂实习 15 条缺详情**：上面 11 家执行后，再传播到子公司即可补齐。
- **职位详情覆盖率**：24,430 条中 3,086 条有 description（13%）。三个标签的覆盖：
  - 26 届热门春招：2223/2223 (100%) ✅
  - 国企央企汇总：2354/2354 (100%) ✅
  - 大厂实习：47/62 (76%)，等上面 11 家补完后 ~95%

### 待执行的 SQL
```
-- 1. 导入 offerqingbaoju 数据（16 批，每批 25 条）
-- 文件：output/oqbj_chunk_0.sql 到 oqbj_chunk_15.sql
-- 用 mcp__supabase__execute_sql 逐个执行

-- 2. 补充 11 家大厂详情
-- 文件：output/bigtech_11_update.sql
-- 内容：11 条 UPDATE，按 company LIKE 匹配母公司+子公司

-- 3. 执行后验证
SELECT '大厂实习' as tag, count(*) FILTER (WHERE description != '') as has_desc, count(*) as total
FROM jobs WHERE tags @> ARRAY['大厂'] AND recruitment_type = '实习';
```

---

## 六、已知问题 / 技术债

### 高优
1. **Supabase 在美国**：中国用户每次 API 请求 RTT 200-400ms。短期无解（需付费迁移到 ap-southeast-1）
2. **useApplications 多实例**：Board/Dashboard/Jobs 各自调用，每个创建独立 Realtime 订阅。应提升为 Context 或 Zustand store

### 中优
3. **城市筛选只在客户端**：Jobs 页的城市下拉只筛已加载的 36 条，不影响服务端查询
4. **Exam 页只有 10 条硬编码数据**：全是技术方向，缺非技术岗
5. **Supabase 项目与英语沉浸平台共用**：auth.users 混在一起，建议独立

### 低优
6. **无微信登录**：目标用户是大学生，微信渗透率 99%，但需后端对接 OAuth
7. **无 prerender**：SPA 对百度 SEO 几乎无效
8. **Board DraggableCard didDrag ref**：在 render 中设置副作用，strict mode 下可能不一致

---

## 七、关键设计规范

### 首页（Editorial）
- 背景：`bg-[#F4F4F0]`（米灰纸张色）
- 标题字体：`font-editorial`（Noto Serif SC 衬线体）
- 标题字号：移动端 `text-4xl`，桌面端 `text-7xl`
- 眉题标签：`text-[11px] tracking-[0.25em] text-[#1C1C1C]/40`
- CTA 按钮：`bg-[#1C1C1C] text-[#F4F4F0] px-8 py-4 rounded-md`
- 链接微交互：`underline underline-offset-[6px] decoration-[#1C1C1C]/15 hover:decoration-[#1C1C1C]` + `group-hover:translate-x-1`

### 工具页（Information Design）
- 背景：`bg-[#F9F9F6]`
- 卡片：`bg-white border border-gray-200 rounded-md shadow-none`
- 公司名：`text-sm md:text-base font-semibold text-slate-900 tracking-tight`
- 岗位标签：`bg-gray-100/80 px-1.5 py-0.5 rounded-sm text-[10px] text-gray-700`
- 元数据：`text-[10px] md:text-xs text-slate-500`，用 `·` 分隔
- 按钮（默认）：`text-slate-600 border border-slate-300 bg-transparent`
- 按钮（hover）：`hover:bg-slate-900 hover:text-white`

### 导航栏
- 背景：`bg-[#F4F4F0]/80 backdrop-blur-md`（与页面融合）
- 分割线：`border-b border-[#1C1C1C]/8`
- 链接：`text-[#1C1C1C]/45 hover:text-[#1C1C1C]`（无底色 hover）

### 底部导航（移动端）
- 4 tab：首页(/) | 职位库(/jobs) | 看板(/board) | 我的(/profile)
- `fixed bottom-0 h-14 bg-white/90 backdrop-blur-xl md:hidden`
- 隐藏：/login、/jobs/:id、/applications/:id

---

## 八、Supabase 连接信息

```
URL: https://zuorqnyxteftxtjrriox.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1b3Jxbnl4dGVmdHh0anJyaW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTg5NjAsImV4cCI6MjA4ODE3NDk2MH0.nngEQiXKwKgTm0A4nDkLXsose2yCLxAVuvBUtNAcisY
```

### Vercel 环境变量
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 九、output/ 目录文件说明

| 文件 | 用途 | 状态 |
|------|------|------|
| `job_details_supplement.json` | 20 家大厂/央企的详情数据（已导入 DB） | ✅ 完成 |
| `bigtech_remaining_11.json` | 11 家大厂详情搜索结果 | ✅ 数据就绪 |
| `bigtech_11_update.sql` | 11 条 UPDATE SQL | ⏳ 待执行 |
| `oqbj_chunk_0~15.sql` | offerqingbaoju 381 条 INSERT（16 批） | ⏳ 待执行 |
| `offerqingbaoju_mapped.json` | 映射后的导入数据 | 参考 |
| 其他 `oqbj_*` 文件 | 中间过程文件 | 可清理 |

---

## 十、移动端优化 PRD

完整 PRD 在 `docs/mobile-optimization-prd.md`，包含：
- 7 个页面的 Playwright 截图审计（375x812）
- 每页的当前问题 + 目标效果 + 具体改动方案
- P0/P1/P2 优先级排序
- 核心转化指标

**P0 项全部已完成**（登录表单上移、底部导航栏、触控目标、看板/概览登录引导）。

---

## 十一、下一步建议

1. **执行待定 SQL**：先执行 `bigtech_11_update.sql`，再执行 `oqbj_chunk_*.sql`
2. **Supabase 项目独立**：为校招助手创建独立 Supabase 项目，迁移数据
3. **域名切换**：从 chunzhao.vercel.app 迁移到 offer123.cc
4. **微信登录**：对接微信 OAuth，大幅降低注册门槛
5. **数据持续更新**：建立定期抓取+导入的数据管线
6. **useApplications 提升为 Context**：消除多实例 Realtime 订阅问题
