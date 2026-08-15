import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `app-nav__link${isActive ? ' app-nav__link--active' : ''}`

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isWide = location.pathname === '/playground'
  return (
    <div className={`chat-page${isWide ? ' chat-page--wide' : ''}`}>
      <img src={logo} style={{ width: '100px', height: '60px' }} onClick={() => navigate('/')} />
      <h1 className="chat-page__title">AI Assistant Chat</h1>
      <nav className="app-nav" aria-label="Main">
        <NavLink
          to="/"
          end
          className={navClass}
          data-testid="nav-tab-chat"
        >
          Chat
        </NavLink>
        <NavLink
          to="/search"
          className={navClass}
          data-testid="nav-tab-search"
        >
          Search in chats
        </NavLink>
        <NavLink
          to="/history"
          className={navClass}
          data-testid="nav-tab-history"
        >
          Message history
        </NavLink>
        <NavLink
          to="/playground"
          className={navClass}
          data-testid="nav-tab-playground"
        >
          Playground
        </NavLink>
        <NavLink to="/help" className={navClass} data-testid="nav-tab-help">
          Help
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
