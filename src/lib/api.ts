import axios from 'axios';

export interface ParseResult {
  title: string;
  content: string;
  url: string;
}

// API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://r.jina.ai';
const API_KEY = import.meta.env.VITE_API_KEY || '';

/**
 * 解析网页链接为Markdown格式
 */
export async function parseUrlToMarkdown(url: string): Promise<ParseResult> {
  try {
    // 尝试使用配置的API
    const result = await parseWithApi(url);
    return result;
  } catch (error) {
    console.error('API解析失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    throw new Error(`解析失败: ${errorMessage}`);
  }
}

/**
 * 使用配置的API解析
 */
async function parseWithApi(url: string): Promise<ParseResult> {
  // 检查是否是外部API URL
  if (API_BASE_URL.includes('://') && !API_BASE_URL.includes('r.jina.ai')) {
    // 使用POST请求到自定义API
    return await parseWithCustomApi(url);
  }
  
  // 使用Jina AI格式
  return await parseWithJinaStyle(url);
}

/**
 * 自定义API解析 (POST格式)
 */
async function parseWithCustomApi(url: string): Promise<ParseResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await axios.post(
    `${API_BASE_URL}/api/parse`,
    { url },
    {
      headers,
      timeout: 30000,
    }
  );

  // 处理响应
  if (response.data?.success === false) {
    const errorMsg = response.data?.error?.message || '解析失败';
    throw new Error(errorMsg);
  }

  if (response.data?.data) {
    return {
      title: response.data.data.title || extractDomainFromUrl(url),
      content: response.data.data.content,
      url: response.data.data.url || url,
    };
  }

  // 兼容直接返回内容的格式
  if (response.data?.content) {
    return {
      title: response.data.title || extractDomainFromUrl(url),
      content: response.data.content,
      url,
    };
  }

  throw new Error('API返回格式不正确');
}

/**
 * Jina AI 风格解析 (GET格式)
 */
async function parseWithJinaStyle(url: string): Promise<ParseResult> {
  const headers: Record<string, string> = {
    'Accept': 'text/markdown',
  };
  
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const apiUrl = `${API_BASE_URL}/${url}`;

  const response = await axios.get(apiUrl, {
    headers,
    timeout: 30000,
  });

  // 检查是否返回错误
  if (response.data && typeof response.data === 'object') {
    if (response.data.code) {
      const errorMsg = response.data.readableMessage || response.data.message || 'API返回错误';
      
      if (errorMsg.includes('blocked')) {
        throw new Error('该网站暂时无法解析，可尝试配置自定义API');
      }
      if (errorMsg.includes('DDoS') || errorMsg.includes('Too many requests')) {
        throw new Error('请求过于频繁，请稍后再试');
      }
      
      throw new Error(errorMsg);
    }
  }

  const markdown = response.data;
  const title = extractTitle(markdown, url);

  return {
    title,
    content: markdown,
    url,
  };
}

/**
 * 从Markdown中提取标题
 */
function extractTitle(markdown: string, url: string): string {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  const htmlTitleMatch = markdown.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (htmlTitleMatch) {
    return htmlTitleMatch[1].trim();
  }

  return extractDomainFromUrl(url);
}

/**
 * 从URL提取域名
 */
function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '未命名文章';
  }
}

/**
 * 下载Markdown文件
 */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
