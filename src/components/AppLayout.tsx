import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTid } from '../hardMode/useHardMode'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `app-nav__link${isActive ? ' app-nav__link--active' : ''}`

export default function AppLayout() {
  const navigate = useNavigate()
  const tid = useTid()
  const location = useLocation()
  const isWide = location.pathname === '/playground'
  return (
    <div className={`chat-page${isWide ? ' chat-page--wide' : ''}`}>
      <header className="app-header">
        <button
          type="button"
          className="app-brand"
          onClick={() => navigate('/')}
          aria-label="Go to the chat screen"
        >
          <span className="app-brand__logo" aria-hidden="true" />
        </button>
        <h1 className="chat-page__title">Playwright Chat Lab</h1>
      </header>
      <nav className="app-nav" aria-label="Main">
        <NavLink
          to="/"
          end
          className={navClass}
          {...tid('nav-tab-chat')}
        >
          Chat
        </NavLink>
        <NavLink
          to="/search"
          className={navClass}
          {...tid('nav-tab-search')}
        >
          Search
        </NavLink>
        <NavLink
          to="/history"
          className={navClass}
          {...tid('nav-tab-history')}
        >
          Message history
        </NavLink>
        <NavLink
          to="/playground"
          className={navClass}
          {...tid('nav-tab-playground')}
        >
          Playground
        </NavLink>
        <NavLink to="/help" className={navClass} {...tid('nav-tab-help')}>
          Help
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
