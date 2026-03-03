import React, { useState } from 'react';
import { Input, Button } from 'tdesign-react';
import { Message } from './Message';
import './UrlInput.css';

interface UrlInputProps {
  onParse: (url: string) => void;
  loading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onParse, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      Message.warning('请输入链接');
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      Message.error('请输入有效的 URL');
      return;
    }

    onParse(trimmedUrl);
  };

  return (
    <div className="url-input-section">
      <div className="input-wrapper">
        <div className="input-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <Input
          value={url}
          onChange={(value) => setUrl(value)}
          onEnter={handleSubmit}
          placeholder="粘贴文章链接，开始提取内容..."
          size="large"
          className="url-input-field"
          disabled={loading}
        />
        <Button
          theme="primary"
          onClick={handleSubmit}
          loading={loading}
          className="submit-btn"
        >
          {loading ? '解析中...' : '开始解析'}
        </Button>
      </div>
    </div>
  );
};

export default UrlInput;
