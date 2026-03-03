import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import EditPage from './pages/EditPage';
import HistoryPage from './pages/HistoryPage';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
