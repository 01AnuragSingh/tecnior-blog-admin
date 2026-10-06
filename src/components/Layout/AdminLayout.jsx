import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false)

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false)
  }

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        transition-colors duration-200
        dark:bg-slate-950
      "
    >
      {/* ================================================
          DESKTOP FIXED SIDEBAR
      ================================================= */}

      <aside
        className="
          fixed left-0 top-0 z-50
          hidden h-screen w-[272px]
          lg:block
        "
      >
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={closeMobileSidebar}
        />
      </aside>

      {/* ================================================
          MOBILE SIDEBAR
      ================================================= */}

      <div className="lg:hidden">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={closeMobileSidebar}
        />
      </div>

      {/* ================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className="
          min-h-screen
          lg:ml-[272px]
        "
      >
        {/* Header */}
        <Header
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        {/* Page Content */}
        <main
          className="
            min-h-[calc(100vh-80px)]
            p-4
            transition-colors duration-200
            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout