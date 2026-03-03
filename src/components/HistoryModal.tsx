import React, { useEffect, useState } from 'react';
import { Button, Empty, Loading, Dialog } from 'tdesign-react';
import { getHistoryList, deleteHistoryRecord } from '../lib/supabase';
import type { ClipHistory } from '../lib/supabase';
import { Message } from './Message';
import './HistoryModal.css';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (record: ClipHistory) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose, onSelect }) => {
  const [historyList, setHistoryList] = useState<ClipHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible]);

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

  const handleSelect = (record: ClipHistory) => {
    onSelect(record);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
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

  return (
    <Dialog
      header="解析历史"
      visible={visible}
      onClose={onClose}
      width="600px"
      className="history-dialog"
      footer={false}
    >
      <div className="history-modal-content">
        {loading ? (
          <div className="history-loading">
            <Loading size="medium" />
          </div>
        ) : historyList.length === 0 ? (
          <Empty description="暂无解析记录" />
        ) : (
          <div className="history-list">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleSelect(item)}
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
        )}
      </div>
    </Dialog>
  );
};

export default HistoryModal;
