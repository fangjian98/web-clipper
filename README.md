# Web Clipper (网页剪藏工具)

这是一个基于 Node.js 开发的网页文章剪藏工具，专门用于将网页文章（如知乎、微信公众号等）抓取并转换为格式规范、内容纯净的 Markdown 文件。

## 项目特点

- **绕过反爬虫检测**：集成 `puppeteer-extra-plugin-stealth` 插件，模拟真实用户行为，有效应对知乎、微信等平台的自动化访问限制。
- **正文智能提取**：使用 Mozilla 的 `Readability` 算法（Firefox 阅读模式同款），自动识别文章标题和正文，过滤导航、广告、侧边栏等无关元素。
- **高质量 Markdown 转换**：采用 `Turndown` 库，确保转换后的 Markdown 语法规范、排版清晰，并保留图片链接。
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

## 使用方法

在终端中执行以下命令，将 `<URL>` 替换为你想要抓取的文章链接：

```bash
node clipper.js <URL>
```

### 示例

抓取知乎文章：
```bash
node clipper.js https://zhuanlan.zhihu.com/p/2011434236989682345
```

抓取微信公众号文章：
```bash
node clipper.js https://mp.weixin.qq.com/s/W7-olJj_QQdyYix1XP7ZeQ
```

执行成功后，Markdown 文件将自动生成在项目根目录下。
