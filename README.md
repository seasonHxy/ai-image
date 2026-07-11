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
- **深色/浅色模式** — 自动跟随系统主题
- **响应式设计** — 支持桌面和移动端

## 技术栈

- **框架**: Next.js 16 (App Router, Turbopack)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4 + CSS 变量主题
- **图标**: Lucide React
- **灯箱**: Yet Another React Lightbox
- **导出**: JSZip
- **图片生成**: Pollinations.ai API (免费，无需 API Key)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 测试卡券

注册后可使用以下测试 CDK 充值额度：

| CDK | 额度 |
|-----|------|
| `PX-TEST-0001-CRED-0010` | 10 张 |
| `PX-TEST-0002-CRED-0050` | 50 张 |
| `PX-DEMO-2024-FREE-0003` | 3 张 |

## API 接口

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

## 项目结构

```
ai-image/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 主页面 (客户端组件)
│   ├── globals.css             # 全局样式 + CSS 变量主题
│   └── api/                    # API 路由
│       ├── auth/               # 认证相关
│       ├── generate-images/    # 图片生成
│       ├── topics/             # 任务管理
│       ├── tasks/              # 任务操作 (取消/重试)
│       ├── redeem/             # CDK 兑换
│       └── feedback/           # 用户反馈
├── components/
│   ├── AuthScreen.tsx          # 落地页
│   ├── AuthDialog.tsx          # 登录/注册/重置密码
│   ├── Sidebar.tsx             # 侧边栏 (任务列表 + 账户菜单)
│   ├── Workspace.tsx           # 工作区 (生成 + 画布历史)
│   ├── ImageGenerator.tsx      # 图片生成表单
│   ├── CanvasHistory.tsx       # 画布消息历史
│   ├── PresetTemplates.tsx     # 预设模板卡片
│   ├── Lightbox.tsx            # 图片灯箱
│   ├── dialogs/                # 对话框组件
│   │   ├── CreditsDialog.tsx   # 充值额度
│   │   ├── InviteDialog.tsx    # 邀请好友
│   │   ├── FeedbackDialog.tsx  # 提交反馈
│   │   └── ChangePasswordDialog.tsx
│   └── ui/                     # 基础 UI 组件
│       ├── Dialog.tsx          # 通用对话框
│       └── Toast.tsx           # 通知组件
├── lib/
│   ├── types.ts                # TypeScript 类型定义
│   ├── store.ts                # 内存数据存储
│   ├── auth.ts                 # 密码哈希、Token 生成
│   ├── session.ts              # 会话管理
│   ├── presets.ts              # 预设模板数据
│   └── utils.ts                # 工具函数
└── public/                     # 静态资源
```

## 说明

- 数据存储使用内存（`globalThis`），重启后重置。生产环境应替换为数据库。
- 图片生成使用 [Pollinations.ai](https://pollinations.ai) 免费 API，无需 API Key。
- 验证码为演示模式，直接返回在 API 响应中（`demoCode` 字段）。生产环境应接入邮件服务。
- 仅支持 QQ 邮箱和 Gmail 邮箱注册。
