# Web Clipper API 接口规范

## 基础信息

- **Base URL**: 可配置，默认为 `https://r.jina.ai`
- **请求方式**: GET
- **返回格式**: Markdown 纯文本

## 接口设计

### 1. 解析网页（主要接口）

```
GET /{url}
```

**请求示例**:
```
GET https://your-api.com/https://example.com/article
```

或

```
POST /parse
Content-Type: application/json

{
  "url": "https://example.com/article"
}
```

**响应示例**:
```markdown
# 文章标题

文章正文内容...

## 二级标题

更多内容...
```

---

### 2. 推荐接口格式（统一）

我们推荐使用以下更灵活的接口设计：

#### 接口A: GET 请求

```
GET /extract?url={encoded_url}
```

**示例**:
```
GET /extract?url=https%3A%2F%2Fexample.com%2Farticle
```

#### 接口B: POST 请求（推荐）

```
POST /api/parse
Content-Type: application/json

{
  "url": "https://example.com/article"
}
```

**成功响应 (200)**:
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

**错误响应 (4xx/5xx)**:
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

## 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 是否成功 |
| data.title | string | 文章标题 |
| data.content | string | Markdown 格式的文章内容 |
| data.url | string | 原始URL |
| data.createdAt | string | 解析时间 (ISO 8601) |
| error.code | string | 错误代码 |
| error.message | string | 错误消息 |

---

## 错误代码

| 代码 | HTTP状态码 | 说明 |
|------|------------|------|
| INVALID_URL | 400 | URL格式无效 |
| URL_REQUIRED | 400 | URL为空 |
| PARSE_ERROR | 500 | 解析失败 |
| ACCESS_DENIED | 403 | 访问被拒绝（反爬虫） |
| NOT_FOUND | 404 | 页面不存在 |
| TIMEOUT | 408 | 请求超时 |
| RATE_LIMITED | 429 | 请求过于频繁 |

---

## 前端配置

在 `.env` 文件中配置API地址：

```bash
# API 地址
VITE_API_BASE_URL=https://your-api.com

# 可选：API Key
VITE_API_KEY=your-api-key
```

---

## 完整调用示例

### JavaScript/Fetch

```javascript
async function parseUrl(url) {
  const response = await fetch('https://your-api.com/api/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Title:', result.data.title);
    console.log('Content:', result.data.content);
  } else {
    console.error('Error:', result.error.message);
  }
}
```

### cURL

```bash
curl -X POST https://your-api.com/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/article"}'
```
