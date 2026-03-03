import React, { useState, useRef } from 'react';
import { Button, Space, Dialog, Input } from 'tdesign-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { downloadMarkdown, copyToClipboard } from '../lib/api';
import { Message } from './Message';
import './ResultPanel.css';

interface ResultPanelProps {
  title: string;
  content: string;
  url: string;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ title, content, url }) => {
  const [markdownContent, setMarkdownContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    const success = await copyToClipboard(markdownContent);
    if (success) {
      setCopied(true);
      Message.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } else {
      Message.error('复制失败');
    }
  };

  const handleDownload = () => {
    const filename = title.replace(/[<>:"/\\|?*]/g, '_').trim() || 'clip';
    downloadMarkdown(markdownContent, filename);
    Message.success('下载成功');
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      Message.warning('请输入图片地址');
      return;
    }
    
    const imageMarkdown = imageAlt ? `![${imageAlt}](${imageUrl})` : `![](${imageUrl})`;
    
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = markdownContent.slice(0, start) + imageMarkdown + markdownContent.slice(end);
      setMarkdownContent(newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + imageMarkdown.length;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setMarkdownContent(prev => prev + '\n' + imageMarkdown);
    }
    
    setShowImageDialog(false);
    setImageUrl('');
    setImageAlt('');
    Message.success('图片已插入');
  };

  const insertAtCursor = (prefix: string, suffix: string = '') => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = markdownContent.slice(start, end);
      const newContent = markdownContent.slice(0, start) + prefix + selectedText + suffix + markdownContent.slice(end);
      setMarkdownContent(newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + prefix.length;
          textareaRef.current.selectionEnd = start + prefix.length + selectedText.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="result-section">
      <div className="result-header">
        <div className="result-info">
          <h2 className="result-title">{title}</h2>
          <a href={url} target="_blank" rel="noopener noreferrer" className="result-url">
            {url}
          </a>
        </div>
        <Space className="result-actions">
          <Button 
            variant={copied ? 'base' : 'outline'}
            onClick={handleCopy}
            className="action-btn"
          >
            {copied ? '已复制' : '复制'}
          </Button>
          <Button 
            theme="primary" 
            onClick={handleDownload}
            className="action-btn"
          >
            下载 MD
          </Button>
        </Space>
      </div>

      <div className="result-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-label">Markdown 编辑器</span>
        </div>
        <div className="toolbar-right">
          <Button size="small" variant="text" onClick={() => insertAtCursor('**', '**')} title="粗体">
            <strong>B</strong>
          </Button>
          <Button size="small" variant="text" onClick={() => insertAtCursor('*', '*')} title="斜体">
            <em>I</em>
          </Button>
          <Button size="small" variant="text" onClick={() => insertAtCursor('`', '`')} title="代码">
            {'</>'}
          </Button>
          <Button size="small" variant="text" onClick={() => insertAtCursor('[', '](url)')} title="链接">
            🔗
          </Button>
          <Button size="small" variant="text" onClick={() => setShowImageDialog(true)} title="插入图片">
            🖼️
          </Button>
          <Button size="small" variant="text" onClick={() => insertAtCursor('# ')} title="标题">
            H1
          </Button>
          <Button size="small" variant="text" onClick={() => insertAtCursor('## ')} title="二级标题">
            H2
          </Button>
        </div>
      </div>

      <div className="result-panels">
        <div className="panel preview-panel">
          <div className="panel-header">
            <span className="panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              预览
            </span>
          </div>
          <div className="panel-content preview-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>

        <div className="panel editor-panel">
          <div className="panel-header">
            <span className="panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              编辑
            </span>
          </div>
          <div className="panel-content">
            <textarea
              ref={textareaRef}
              className="markdown-editor"
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* 图片插入对话框 */}
      <Dialog
        header="插入图片"
        visible={showImageDialog}
        onClose={() => setShowImageDialog(false)}
      >
        <div className="image-dialog-content">
          <div className="form-item">
            <label>图片地址</label>
            <Input
              value={imageUrl}
              onChange={(value) => setImageUrl(value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-item">
            <label>图片描述（可选）</label>
            <Input
              value={imageAlt}
              onChange={(value) => setImageAlt(value)}
              placeholder="图片说明文字"
            />
          </div>
        </div>
        <div className="dialog-footer">
          <Button variant="outline" onClick={() => setShowImageDialog(false)}>取消</Button>
          <Button theme="primary" onClick={handleInsertImage}>插入</Button>
        </div>
      </Dialog>
    </div>
  );
};

export default ResultPanel;
