# Web Clipper API 接口规范

本项目支持两种 API 格式，通过环境变量自动切换。

---

## 方式一：Jina AI 风格（默认）

### 基础信息

- **Base URL**: `https://r.jina.ai`（默认）
- **请求方式**: GET
- **返回格式**: Markdown 纯文本
- **API Key**: 可选

### 接口说明

```
GET /{url}
```

将目标 URL 直接拼接在路径后。

### 请求示例

```bash
GET https://r.jina.ai/https://example.com/article
```

### 响应示例

```markdown
# 文章标题

文章正文内容...

## 二级标题

更多内容...
```

### 配置方式

无需配置，默认使用此方式。如需添加 API Key：

```bash
# .env
VITE_API_KEY=your-jina-api-key
```

---

## 方式二：自定义 API（推荐）

### 基础信息

- **Base URL**: 自定义（如 `https://your-api.com`）
- **请求方式**: POST
- **返回格式**: JSON
- **API Key**: 支持

### 接口说明

```
POST /api/parse
Content-Type: application/json
```

### 请求示例

```bash
POST https://your-api.com/api/parse
Content-Type: application/json

{
  "url": "https://example.com/article"
}
```

### 成功响应 (200)

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

### 错误响应 (4xx/5xx)

```json
{
  "success": false,
  "error": {
    "code": "PARSE_ERROR",
    "message": "解析失败，网站无法访问"
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 是否成功 |
| data.title | string | 文章标题 |
| data.content | string | Markdown 格式的文章内容 |
| data.url | string | 原始 URL |
| data.createdAt | string | 解析时间 (ISO 8601) |
| error.code | string | 错误代码 |
| error.message | string | 错误消息 |

### 配置方式

```bash
# .env
VITE_API_BASE_URL=https://your-api.com
VITE_API_KEY=your-api-key
```

---

## 错误代码

| 代码 | HTTP状态码 | 说明 |
|------|------------|------|
| INVALID_URL | 400 | URL 格式无效 |
| URL_REQUIRED | 400 | URL 为空 |
| PARSE_ERROR | 500 | 解析失败 |
| ACCESS_DENIED | 403 | 访问被拒绝（反爬虫） |
| NOT_FOUND | 404 | 页面不存在 |
| TIMEOUT | 408 | 请求超时 |
| RATE_LIMITED | 429 | 请求过于频繁 |

---

## 调用示例

### cURL

方式一（Jina AI）：
```bash
curl https://r.jina.ai/https://example.com/article
```

方式二（自定义 API）：
```bash
curl -X POST https://your-api.com/api/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"url":"https://example.com/article"}'
```

### JavaScript

方式一（Jina AI）：
```javascript
const response = await fetch('https://r.jina.ai/https://example.com/article');
const markdown = await response.text();
```

方式二（自定义 API）：
```javascript
const response = await fetch('https://your-api.com/api/parse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({ url: 'https://example.com/article' })
});

const result = await response.json();

if (result.success) {
  console.log('Title:', result.data.title);
  console.log('Content:', result.data.content);
} else {
  console.error('Error:', result.error.message);
}
```

---

## 切换逻辑

项目根据 `VITE_API_BASE_URL` 配置自动选择 API 格式：

- **未配置** 或 `VITE_API_BASE_URL` 包含 `r.jina.ai` → 使用方式一
- **已配置** 且不包含 `r.jina.ai` → 使用方式二
