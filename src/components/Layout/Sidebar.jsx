import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Sidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'All Blogs',
      path: '/blogs',
      icon: FileText,
    },
    {
      name: 'Create Blog',
      path: '/blogs/create',
      icon: PlusCircle,
    },
  ]

  const handleLogout = () => {
    onClose()
    logout()
  }

  return (
    <>
      {/* ================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed inset-0 z-40
            bg-slate-950/60
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* ================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-72 flex-col
          border-r border-slate-800
          bg-slate-950 text-white
          shadow-2xl shadow-slate-950/20
          transition-transform duration-300
          ease-in-out
          lg:translate-x-0
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {/* ==============================================
            LOGO
        ============================================== */}

        <div
          className="
            flex h-20 shrink-0
            items-center justify-between
            border-b border-slate-800
            px-6
          "
        >
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-blue-600
                shadow-lg
                shadow-blue-600/20
              "
            >
              <BarChart3 size={21} />
            </div>

            {/* Logo Text */}
            <div>
              <h1 className="font-bold tracking-tight">
                TechNior
              </h1>

              <p className="text-xs text-slate-400">
                Blog Admin
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="
              rounded-lg p-2
              text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
              lg:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ==============================================
            NAVIGATION
        ============================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p
            className="
              mb-3 px-3
              text-xs font-semibold
              uppercase tracking-wider
              text-slate-500
            "
          >
            Main Menu
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/blogs'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? `
                          bg-blue-600
                          text-white
                          shadow-lg
                          shadow-blue-600/20
                        `
                        : `
                          text-slate-400
                          hover:bg-slate-800
                          hover:text-white
                        `
                    }
                  `
                  }
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* ==============================================
            LOGOUT
        ============================================== */}

        <div
          className="
            shrink-0
            border-t border-slate-800
            p-4
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full
              items-center gap-3
              rounded-xl px-3 py-3
              text-sm font-medium
              text-slate-400
              transition
              hover:bg-red-500/10
              hover:text-red-400
            "
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar