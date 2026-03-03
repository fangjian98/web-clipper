import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, MessageProvider, Message } from './components';
import { parseUrlToMarkdown } from './lib/api';
import { createHistoryRecord } from './lib/supabase';
import HomeContent from './components/HomeContent';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleParse = async (url: string) => {
    setLoading(true);
    try {
      const parseResult = await parseUrlToMarkdown(url);

      // 保存到历史记录
      await createHistoryRecord(
        parseResult.url,
        parseResult.title,
        parseResult.content
      );

      // 跳转到编辑页面
      navigate('/edit', {
        state: {
          url: parseResult.url,
          data: parseResult
        }
      });
    } catch (error) {
      console.error(error);
      Message.error(error instanceof Error ? error.message : '解析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <HomeContent onParse={handleParse} loading={loading} />
      </main>
    </div>
  );
}

function App() {
  return (
    <MessageProvider>
      <AppContent />
    </MessageProvider>
  );
}

export default App;
