import { useState } from 'react';
import { Header, UrlInput, ResultPanel, HistoryModal, HomeContent, MessageProvider, Message } from './components';
import { parseUrlToMarkdown } from './lib/api';
import { createHistoryRecord } from './lib/supabase';
import type { ClipHistory } from './lib/supabase';
import './App.css';

function AppContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    content: string;
    url: string;
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleParse = async (url: string) => {
    setLoading(true);
    try {
      const parseResult = await parseUrlToMarkdown(url);
      setResult(parseResult);

      // 保存到历史记录
      await createHistoryRecord(
        parseResult.url,
        parseResult.title,
        parseResult.content
      );

      Message.success('解析成功！');
    } catch (error) {
      console.error(error);
      Message.error(error instanceof Error ? error.message : '解析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = (record: ClipHistory) => {
    setResult({
      title: record.title,
      content: record.content,
      url: record.url,
    });
    Message.info('已加载历史记录');
  };

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  return (
    <div className="app">
      <Header onShowHistory={handleShowHistory} />
      
      <main className="main-content">
        <UrlInput onParse={handleParse} loading={loading} />
        
        {result ? (
          <ResultPanel
            title={result.title}
            content={result.content}
            url={result.url}
          />
        ) : (
          <HomeContent />
        )}
      </main>

      <HistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        onSelect={handleLoadHistory}
      />
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
