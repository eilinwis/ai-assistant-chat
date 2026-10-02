import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatHistoryProvider } from './components/ChatHistoryProvider'
import AppLayout from './components/AppLayout'
import ChatPage from './pages/ChatPage'
import HelpPage from './pages/HelpPage'
import HistoryPage from './pages/HistoryPage'
import PlaygroundPage from './pages/PlaygroundPage'
import SearchChatsPage from './pages/SearchChatsPage'
import ThemeSwitcher from './components/ThemeSwitcher'
import { HardModeProvider } from './hardMode/HardModeProvider'
import HardModeToggle from './hardMode/HardModeToggle'
import OverlayRoot from './hardMode/overlays/OverlayRoot'
import './styles.css'

export default function App() {
  return (
    <BrowserRouter>
      <HardModeProvider>
        <ChatHistoryProvider>
          <div className="app">
            <HardModeToggle />
            <ThemeSwitcher />
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<ChatPage />} />
                <Route path="/search" element={<SearchChatsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/playground" element={<PlaygroundPage />} />
                <Route path="/help" element={<HelpPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <OverlayRoot />
          </div>
        </ChatHistoryProvider>
      </HardModeProvider>
    </BrowserRouter>
  )
}
