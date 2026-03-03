import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from '../components/Header';
import { parseUrl } from '../lib/api';
import type { ParseResult } from '../lib/api';
import './EditPage.css';

export default function EditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { data?: ParseResult; url?: string } | null;
    if (state?.data) {
      setTitle(state.data.title || '');
      setContent(state.data.content || '');
      setUrl(state.url || '');
    }
  }, [location.state]);

  const handleBack = () => {
    navigate('/');
  };

  const handleRefresh = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const result = await parseUrl(url);
      setTitle(result.title || '');
      setContent(result.content || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const filename = title ? `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.md` : 'document.md';
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="edit-page">
      <Header showHistory />

      <div className="edit-container">
        <div className="edit-toolbar">
          <button className="toolbar-btn" onClick={handleBack} title="返回">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <input
            type="text"
            className="title-input"
            placeholder="输入标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="toolbar-actions">
            <button className="toolbar-btn" onClick={handleRefresh} disabled={!url || loading} title="重新解析">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
            <button className="toolbar-btn" onClick={handleCopy} title="复制">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
            <button className="toolbar-btn primary" onClick={handleDownload} title="下载">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>下载</span>
            </button>
          </div>
        </div>

        {url && (
          <div className="url-bar">
            <span className="url-label">来源：</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="url-link">{url}</a>
          </div>
        )}

        <div className="editor-layout">
          <div className="editor-pane">
            <div className="pane-header">
              <span>编辑</span>
            </div>
            <div className="markdown-toolbar">
              <button onClick={() => insertMarkdown('**', '**')} title="粗体">B</button>
              <button onClick={() => insertMarkdown('*', '*')} title="斜体"><i>I</i></button>
              <button onClick={() => insertMarkdown('`', '`')} title="代码">{'</>'}</button>
              <button onClick={() => insertMarkdown('[', '](url)')} title="链接">🔗</button>
              <button onClick={() => insertMarkdown('![alt](', ')')} title="图片">🖼️</button>
              <button onClick={() => insertMarkdown('# ')} title="标题">H</button>
              <button onClick={() => insertMarkdown('- ')} title="列表">•</button>
            </div>
            <textarea
              ref={textareaRef}
              className="markdown-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此输入Markdown内容..."
            />
          </div>

          <div className="preview-pane">
            <div className="pane-header">
              <span>预览</span>
            </div>
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
