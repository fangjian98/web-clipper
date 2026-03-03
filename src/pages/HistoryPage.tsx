import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getHistoryList, deleteHistoryRecord } from '../lib/supabase';
import type { ClipHistory } from '../lib/supabase';
import './HistoryPage.css';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState<ClipHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const list = await getHistoryList();
      setHistoryList(list);
    } catch (err) {
      console.error('加载历史记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: ClipHistory) => {
    navigate('/edit', {
      state: {
        url: item.url,
        data: {
          title: item.title,
          content: item.content,
          url: item.url,
        }
      }
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteHistoryRecord(id);
    loadHistory();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="history-page">
      <Header showHistory />

      <div className="history-container">
        <div className="history-header">
          <h1>解析历史</h1>
          <p>{historyList.length} 条记录</p>
        </div>

        {loading ? (
          <div className="history-loading">加载中...</div>
        ) : historyList.length === 0 ? (
          <div className="history-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p>暂无解析记录</p>
          </div>
        ) : (
          <div className="history-list">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleItemClick(item)}
              >
                <div className="history-item-content">
                  <h3>{item.title || '无标题'}</h3>
                  <p className="history-url">{getDomain(item.url)}</p>
                  <p className="history-preview">
                    {item.content?.substring(0, 100).replace(/[#*`]/g, '') || '无内容'}
                  </p>
                </div>
                <div className="history-item-meta">
                  <span className="history-date">{formatDate(item.created_at)}</span>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(e, item.id)}
                    title="删除"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
