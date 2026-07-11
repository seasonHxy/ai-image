# AI 图片生成工作台

批量生成商业图片，从一张参考图开始。基于 Next.js 构建的 AI 图片生成工作台，支持多张出图、任务队列、历史复用和持续迭代。

## 功能特性

- **AI 图片生成** — 基于 Pollinations.ai (Flux 模型) 的免费图片生成，支持批量生成最多 12 张
- **参考图驱动** — 上传最多 8 张参考图，保持商品/人物一致性
- **任务系统** — 任务队列管理，支持创建、重命名、删除、取消、重试
- **额度系统** — 注册送 3 张额度，邀请好友获得额度，CDK 卡券充值
- **用户认证** — 邮箱密码注册登录（QQ/Gmail），邮箱验证码，密码强度检测
- **预设模板** — 8 套预设模板（电商商品图、旅拍大片、个人写真等）
- **图片管理** — 灯箱预览、单张下载、批量 ZIP 导出、生成图加入参考图
- **管理后台** — CDK 卡券管理、用户列表、反馈查看、平台数据统计
- **深色/浅色模式** — 自动跟随系统主题
- **响应式设计** — 支持桌面和移动端

## 技术栈

- **框架**: Next.js 16 (App Router, Turbopack, standalone output)
- **语言**: TypeScript
- **数据库**: SQLite (better-sqlite3)
- **样式**: Tailwind CSS v4 + CSS 变量主题
- **图标**: Lucide React
- **灯箱**: Yet Another React Lightbox
- **导出**: JSZip
- **图片生成**: Pollinations.ai API (免费，无需 API Key)

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

管理后台: [http://localhost:3000/admin](http://localhost:3000/admin)

## Docker 部署

```bash
# 设置环境变量
export ADMIN_KEY=your-strong-secret-key

# 构建并启动
docker compose up -d

# 查看日志
docker compose logs -f
```

数据持久化通过 Docker volume `ai-image-data` 自动管理。

## 环境配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ADMIN_KEY` | 管理后台密钥 | `change-me-to-a-strong-random-string` |
| `SITE_URL` | 站点 URL (SEO) | `http://localhost:3000` |
| `EMAIL_ENABLED` | 启用邮件发送 | `false` |
| `SMTP_HOST` | SMTP 服务器 | - |
| `SMTP_PORT` | SMTP 端口 | `587` |
| `SMTP_USER` | SMTP 用户名 | - |
| `SMTP_PASS` | SMTP 密码 | - |
| `SMTP_FROM` | 发件人地址 | - |

## 测试卡券

注册后可使用以下测试 CDK 充值额度：

| CDK | 额度 |
|-----|------|
| `PX-TEST-0001-CRED-0010` | 10 张 |
| `PX-TEST-0002-CRED-0050` | 50 张 |
| `PX-DEMO-2024-FREE-0003` | 3 张 |

也可在管理后台批量生成卡券。

## API 接口

### 用户接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 注册账号 |
| `/api/auth/register/send-code` | POST | 发送注册验证码 |
| `/api/auth/login` | POST | 登录 |
| `/api/auth/me` | GET | 获取当前用户 |
| `/api/auth/logout` | POST | 退出登录 |
| `/api/auth/change-password` | POST | 修改密码 |
| `/api/auth/password-reset/send-code` | POST | 发送重置验证码 |
| `/api/auth/password-reset` | POST | 重置密码 |
| `/api/generate-images` | POST | 生成图片 (FormData) |
| `/api/topics` | GET/POST | 获取/创建任务 |
| `/api/topics/[id]` | GET/PATCH/DELETE | 获取/重命名/删除任务 |
| `/api/tasks/[id]/cancel` | POST | 取消任务 |
| `/api/tasks/[id]/retry` | POST | 重试任务 |
| `/api/redeem` | POST | 兑换 CDK |
| `/api/feedback` | POST | 提交反馈 |
| `/api/uploads/[filename]` | GET | 获取上传的参考图 |
| `/api/health` | GET | 健康检查 |

### 管理接口 (需 Bearer Token)

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/stats` | GET | 平台统计 |
| `/api/admin/cdks` | GET/POST/DELETE | 卡券管理 |
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/feedbacks` | GET | 反馈列表 |

## 项目结构

```
ai-image/
├── app/
│   ├── layout.tsx              # 根布局 (SEO metadata)
│   ├── page.tsx                # 主页面
│   ├── admin/page.tsx          # 管理后台
│   ├── error.tsx               # 错误边界
│   ├── not-found.tsx           # 404 页面
│   ├── global-error.tsx        # 全局错误边界
│   ├── globals.css             # 全局样式
│   ├── sitemap.ts              # 站点地图
│   ├── robots.ts               # 爬虫规则
│   └── api/                    # API 路由
│       ├── auth/               # 认证
│       ├── generate-images/    # 图片生成
│       ├── topics/             # 任务管理
│       ├── tasks/              # 任务操作
│       ├── redeem/             # CDK 兑换
│       ├── feedback/           # 用户反馈
│       ├── uploads/            # 文件服务
│       ├── health/             # 健康检查
│       └── admin/              # 管理接口
├── components/                 # React 组件
├── lib/
│   ├── db.ts                   # SQLite 数据库层
│   ├── storage.ts              # 文件存储
│   ├── auth.ts                 # 密码哈希、Token
│   ├── session.ts              # 会话管理
│   ├── admin.ts                # 管理员认证
│   ├── rateLimit.ts            # 速率限制
│   ├── presets.ts              # 预设模板
│   ├── types.ts                # 类型定义
│   └── utils.ts                # 工具函数
├── data/                       # 运行时数据 (git ignored)
│   ├── ai-image.db             # SQLite 数据库
│   └── uploads/                # 上传文件
├── Dockerfile                  # Docker 镜像
├── docker-compose.yml          # Docker Compose
├── .env.example                # 环境配置模板
└── next.config.ts              # Next.js 配置
```

## 安全特性

- **速率限制** — 登录、注册、验证码、生成、兑换等接口均有频率限制
- **安全头** — X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy
- **密码哈希** — 使用 scrypt 加盐哈希
- **HttpOnly Cookie** — 会话 Cookie 不可被 JavaScript 访问
- **文件上传安全** — 参考图文件名净化处理
- **管理认证** — 管理接口需 Bearer Token 认证

## 说明

- 数据存储使用 SQLite，数据持久化在 `data/ai-image.db`
- 参考图存储在 `data/uploads/references/` 目录
- 图片生成使用 [Pollinations.ai](https://pollinations.ai) 免费 API
- 验证码默认为演示模式（直接返回），配置 SMTP 后可发送真实邮件
- 仅支持 QQ 邮箱和 Gmail 邮箱注册
