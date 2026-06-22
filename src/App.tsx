import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatHistoryProvider } from './components/ChatHistoryProvider'
import AppLayout from './components/AppLayout'
import ChatPage from './pages/ChatPage'
import HelpPage from './pages/HelpPage'
import HistoryPage from './pages/HistoryPage'
import SearchChatsPage from './pages/SearchChatsPage'
import './styles.css'

export default function App() {
  return (
    <BrowserRouter>
      <ChatHistoryProvider>
        <div className="app">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<ChatPage />} />
              <Route path="/search" element={<SearchChatsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ChatHistoryProvider>
    </BrowserRouter>
  )
}
