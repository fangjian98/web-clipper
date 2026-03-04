# Web Clipper (网页剪藏工具)

这是一个基于 Node.js 开发的网页文章剪藏工具，专门用于将网页文章（如知乎、微信公众号等）抓取并转换为格式规范、内容纯净的 Markdown 文件。

## 项目特点

- **绕过反爬虫检测**：集成 `puppeteer-extra-plugin-stealth` 插件，模拟真实用户行为，有效应对知乎、微信等平台的自动化访问限制。
- **正文智能提取**：使用 Mozilla 的 `Readability` 算法（Firefox 阅读模式同款），自动识别文章标题和正文，过滤导航、广告、侧边栏等无关元素。
- **批量处理支持**：支持从 `.csv`、`.xls`、`.xlsx` 或 `.txt` 文件中批量导入链接进行自动化处理。
- **高质量 Markdown 转换**：采用 `Turndown` 库并集成 GFM 插件，支持表格、任务列表等。
- **环境兼容性**：支持使用系统中已安装的 Chrome 浏览器，避免重复下载庞大的 Chromium。

## 实现方案

1. **页面加载**：通过 `Puppeteer` 启动 Chrome 浏览器并导航至目标 URL，使用 `networkidle2` 等待网络空闲。
2. **反检测**：启用 `Stealth` 插件并设置真实的 `User-Agent`，隐藏自动化特征。
3. **内容抓取**：获取页面完全渲染后的 HTML 内容。
4. **正文解析**：利用 `JSDOM` 构建文档对象模型，通过 `Readability` 提取核心文章数据（标题、正文 HTML）。
5. **格式转换**：使用 `Turndown` 将 HTML 片段转换为 Markdown 格式。
6. **本地保存**：根据域名和时间戳自动生成文件名并保存至本地。

## 核心依赖

- `puppeteer-extra`: Puppeteer 的增强版，支持插件扩展。
- `puppeteer-extra-plugin-stealth`: 用于隐藏 Puppeteer 的自动化特征。
- `@mozilla/readability`: 用于从 HTML 中提取文章正文。
- `jsdom`: 在 Node.js 环境中模拟浏览器 DOM。
- `turndown`: 将 HTML 转换为 Markdown。
- `turndown-plugin-gfm`: Turndown 的插件，支持 GitHub Flavored Markdown (GFM)，包括表格、任务列表等。

## 环境配置

### 1. 软件要求
- **Node.js**: 建议使用 LTS 版本。
- **Google Chrome 浏览器**: 本项目需要 Chrome 浏览器来渲染页面。

### 2. 环境配置
1. 在项目根目录下创建 `.env` 文件。
2. 添加以下配置并根据你的实际安装路径修改 `CHROME_PATH`：
   ```env
   CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
   ```
   *注意：代码中也提供了默认路径，如果你的安装路径是标准路径，则可以跳过此步骤。*

### 3. 安装依赖
在项目根目录下运行：
```bash
npm install
```

## API 使用

本项目提供了一个 API 接口，方便第三方服务调用。

### 1. 启动服务器

```bash
npm start
```
服务器默认在 `3000` 端口启动。

## Docker 部署

### 1. 服务器要求

- Docker 已安装
- 端口 8081 可用（或自定义端口）

### 2. 部署命令

```bash
# 拉取代码
git clone <your-repo-url> web_clipper
cd web_clipper

# 构建镜像
docker build -t web-clipper-api .

# 运行容器（后台运行，自动重启）
docker run -d \
  --name web-clipper-api \
  -p 8081:3000 \
  --restart unless-stopped \
  web-clipper-api
```

### 3. 验证部署

```bash
# 检查容器状态
docker ps | grep web-clipper-api

# 测试 API
curl -X POST http://localhost:8081/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 4. 常用运维命令

```bash
# 查看日志
docker logs web-clipper-api

# 查看实时日志
docker logs -f web-clipper-api

# 重启服务
docker restart web-clipper-api

# 停止服务
docker stop web-clipper-api

# 删除容器
docker rm web-clipper-api

# 删除镜像
docker rmi web-clipper-api
```

### 5. 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker build -t web-clipper-api .
docker stop web-clipper-api
docker rm web-clipper-api
docker run -d \
  --name web-clipper-api \
  -p 8081:3000 \
  --restart unless-stopped \
  web-clipper-api

# 清理旧镜像（可选）
docker image prune -f
```

### 6. 自定义配置

```bash
# 使用不同端口（如 3000）
docker run -d \
  --name web-clipper-api \
  -p 3000:3000 \
  --restart unless-stopped \
  web-clipper-api

# 使用环境变量
docker run -d \
  --name web-clipper-api \
  -p 8081:3000 \
  -e PORT=3000 \
  --restart unless-stopped \
  web-clipper-api
```

### 7. 访问地址

部署成功后访问：`http://<服务器IP>:8081/api/parse`

---

### 2. 接口详情

- **Endpoint**: `POST /api/parse`
- **Content-Type**: `application/json`

**请求体 (Body):**
```json
{
  "url": "<要抓取的文章链接>"
}
```

**成功响应 (200 OK):**
```json
{
  "success": true,
  "data": {
    "title": "文章标题",
    "content": "... Markdown 内容 ...",
    "url": "<原始链接>",
    "createdAt": "... ISO 8601 时间戳 ..."
  }
}
```

**失败响应 (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "详细错误信息"
  }
}
```

---

## 命令行使用

在终端中执行以下命令，将 `<Input>` 替换为你想要抓取的**文章链接**或**包含链接的文件路径**：

```bash
node clipper.js <Input>
```

### 1. 抓取单个链接
```bash
node clipper.js https://zhuanlan.zhihu.com/p/2011434236989682345
```

### 2. 批量处理文件
支持 `.csv`、`.xls`、`.xlsx` 和 `.txt` 格式。
- 对于 CSV/Excel：脚本会读取名为 `url` 的列，如果不存在则读取第一列。
- 对于 TXT：每行一个 URL。

```bash
node clipper.js links.csv
node clipper.js list.xlsx
node clipper.js urls.txt
```

执行成功后，Markdown 文件将自动生成在项目根目录下。
