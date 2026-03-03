import React, { useEffect, useState } from 'react';
import { Button, Empty, Loading, Pagination } from 'tdesign-react';
import { getHistoryList, deleteHistoryRecord } from '../lib/supabase';
import type { ClipHistory } from '../lib/supabase';
import { Message } from './Message';
import './HistoryPanel.css';

interface HistoryPanelProps {
  refreshTrigger: number;
  onLoadHistory: (record: ClipHistory) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ refreshTrigger, onLoadHistory }) => {
  const [historyList, setHistoryList] = useState<ClipHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getHistoryList(100);
    setHistoryList(data);
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteHistoryRecord(id);
    if (success) {
      Message.success('删除成功');
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
    } else {
      Message.error('删除失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTitleFromContent = (content: string) => {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : '未命名文章';
  };

  const paginatedList = historyList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="history-section">
      <div className="history-header">
        <h2 className="history-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          解析历史
        </h2>
        <span className="history-count">{historyList.length} 条</span>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="history-loading">
            <Loading size="medium" />
          </div>
        ) : historyList.length === 0 ? (
          <div className="history-empty">
            <Empty description="暂无解析记录" />
          </div>
        ) : (
          <>
            <div className="history-list">
              {paginatedList.map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => onLoadHistory(item)}
                >
                  <div className="history-item-info">
                    <div className="history-item-title">
                      {getTitleFromContent(item.content)}
                    </div>
                    <div className="history-item-meta">
                      <span className="history-item-url">{item.url}</span>
                      <span className="history-item-time">{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                  <Button
                    size="small"
                    variant="text"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="delete-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
            {historyList.length > pageSize && (
              <div className="history-pagination">
                <Pagination
                  total={historyList.length}
                  current={currentPage}
                  pageSize={pageSize}
                  onChange={(pageInfo) => setCurrentPage(pageInfo.current)}
                  size="small"
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default HistoryPanel;
