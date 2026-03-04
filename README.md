# Web Clipper

将任意网页链接一键解析为干净的 Markdown 格式，智能提取文章主体内容，自动去除广告、导航栏等无关元素。

## 功能特性

- **链接解析** - 输入任意网页链接，自动解析为 Markdown 格式
- **智能提取** - 自动去除导航栏、页脚、侧边栏、广告等无关元素
- **双栏编辑** - 左侧编辑 Markdown，右侧实时预览
- **历史记录** - 支持云端存储解析历史，随时查看和恢复
- **文件下载** - 一键下载 Markdown 文件

## 支持平台

知乎、微信公众号、掘金、CSDN、SegmentFault、博客园、简书、小红书、今日头条等主流内容平台。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 路由 | React Router |
| UI 组件 | TDesign |
| HTTP 客户端 | Axios |
| Markdown 渲染 | react-markdown + remark-gfm |
| 数据库 | Supabase (可选) |

---

## 项目架构

```
web-clipper/
├── src/
│   ├── components/        # 公共组件
│   │   ├── Header.tsx     # 头部导航
│   │   ├── UrlInput.tsx   # 链接输入框
│   │   ├── HomeContent.tsx # 首页内容
│   │   └── Message.tsx    # 消息提示
│   ├── pages/             # 页面
│   │   ├── EditPage.tsx   # 编辑页面
│   │   └── HistoryPage.tsx # 历史记录页面
│   ├── lib/               # 工具库
│   │   ├── api.ts         # API 请求封装
│   │   └── supabase.ts    # Supabase 客户端
│   ├── App.tsx            # 主应用
│   ├── Router.tsx         # 路由配置
│   └── index.css          # 全局样式
├── .env                   # 环境变量配置
├── API.md                 # API 接口文档
└── SPEC.md                # 详细规范文档
```

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
copy .env.example .env
```

编辑 `.env` 文件：

```bash
# API 配置
# 方式一：使用默认 Jina AI（无需配置）
# 方式二：使用自定义 API
VITE_API_BASE_URL=https://your-api.com
VITE_API_KEY=your-api-key

# Supabase 配置（可选，用于历史记录云端存储）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

---

## 部署指南

### 方式一：Docker 部署（推荐）

项目已包含 `Dockerfile` 和 `nginx.conf`，可直接使用 Docker 部署：

```bash
# 1. 克隆仓库
git clone <your-repo-url> web-clipper
cd web-clipper

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置 API 地址

# 4. 构建项目
npm run build

# 5. 构建 Docker 镜像
docker build -t web-clipper .

# 6. 运行容器
docker run -d --name web-clipper -p 80:80 --restart=always web-clipper
```

访问：`http://localhost`

### 方式二：Nginx 部署

```bash
# 1-4 步同上

# 5. 复制构建产物到 nginx 目录
sudo cp -r dist/* /var/www/web-clipper/

# 6. 配置 Nginx
sudo nano /etc/nginx/sites-available/web-clipper
```

Nginx 配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/web-clipper;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 7. 启用配置
sudo ln -s /etc/nginx/sites-available/web-clipper /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方式三：静态托管平台

**Vercel：**

```bash
npm i -g vercel
vercel
```

**Netlify：**

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**GitHub Pages：**

```bash
# 安装 gh-pages
npm install --save-dev gh-pages

# 在 package.json 中添加
# "homepage": "https://your-username.github.io/web-clipper"
# "scripts": { "deploy": "gh-pages -d dist" }

npm run build
npm run deploy
```

---

## API 接口

项目支持两种 API 格式，通过环境变量自动切换。

### 方式一：Jina AI 风格（默认）

```bash
GET https://r.jina.ai/{url}
```

返回 Markdown 纯文本，无需配置。

### 方式二：自定义 API（推荐）

```bash
POST https://your-api.com/api/parse
Content-Type: application/json

{
  "url": "https://example.com/article"
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "title": "文章标题",
    "content": "# 文章标题\n\n正文内容...",
    "url": "https://example.com/article",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "error": {
    "code": "PARSE_ERROR",
    "message": "解析失败，网站无法访问"
  }
}
```

---

## 配置说明

### API 切换逻辑

| 配置 | 使用的 API |
|------|-----------|
| `VITE_API_BASE_URL` 未配置或为空 | 默认 Jina AI |
| `VITE_API_BASE_URL` 包含 `r.jina.ai` | Jina AI |
| `VITE_API_BASE_URL` 为其他地址 | 自定义 API |

### Supabase 数据库配置

如需使用历史记录云端存储，需在 Supabase 中创建表：

```sql
create table clip_history (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  title text,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

---

## 错误代码

| 代码 | HTTP 状态码 | 说明 |
|------|------------|------|
| INVALID_URL | 400 | URL 格式无效 |
| URL_REQUIRED | 400 | URL 为空 |
| PARSE_ERROR | 500 | 解析失败 |
| ACCESS_DENIED | 403 | 访问被拒绝（反爬虫） |
| NOT_FOUND | 404 | 页面不存在 |
| TIMEOUT | 408 | 请求超时 |
| RATE_LIMITED | 429 | 请求过于频繁 |

---

## 开发规范

### 代码风格

- 使用 ESLint + TypeScript 进行代码检查
- 组件使用函数式组件 + Hooks
- 样式使用 CSS 变量 + 模块化 CSS

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

---

## License

MIT
