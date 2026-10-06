import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Header({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // =========================================================
  // DARK MODE
  // =========================================================

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem('tecnior_theme') ===
      'dark'
    )
  })

  // =========================================================
// HEADER SEARCH
// =========================================================

const [searchValue, setSearchValue] =
  useState('')

// =========================================================
// NOTIFICATION
// =========================================================

const [hasUnreadNotifications, setHasUnreadNotifications] =
  useState(true)

const [notificationOpen, setNotificationOpen] =
  useState(false)

const notificationRef = useRef(null)

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const fullName = 'Anurag Singh'

  const initials = 'AS'

  // =========================================================
  // DARK MODE EFFECT
  // =========================================================

  useEffect(() => {
    const root = document.documentElement

    if (darkMode) {
      root.classList.add('dark')

      localStorage.setItem(
        'tecnior_theme',
        'dark',
      )
    } else {
      root.classList.remove('dark')

      localStorage.setItem(
        'tecnior_theme',
        'light',
      )
    }
  }, [darkMode])

  // =========================================================
  // NOTIFICATIONS DATA
  // =========================================================

  const notifications = [
    {
      id: 1,
      title: 'New blog post created',
      message:
        'A new blog post is waiting for review.',
      time: '5 min ago',
    },

    {
      id: 2,
      title: 'Blog updated',
      message:
        'Your React Admin Dashboard blog was updated.',
      time: '20 min ago',
    },

    {
      id: 3,
      title: 'Publishing reminder',
      message:
        'You have draft posts ready to publish.',
      time: '1 hour ago',
    },
  ]

  // =========================================================
  // CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target,
        )
      ) {
        setNotificationOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [])

  // =========================================================
  // HEADER SEARCH SUBMIT
  // =========================================================

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const query = searchValue.trim()

    if (!query) {
      navigate('/blogs')
      return
    }

    navigate(
      `/blogs?search=${encodeURIComponent(
        query,
      )}`,
    )
  }

  // =========================================================
  // HEADER SEARCH KEYBOARD
  // =========================================================

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSearchValue('')
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-20 items-center
        justify-between
        border-b border-slate-200
        bg-white/95
        px-4
        backdrop-blur
        transition-colors duration-200

        dark:border-slate-800
        dark:bg-slate-950/95

        sm:px-6
        lg:px-8
      "
    >
      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="flex items-center gap-4">
        {/* MOBILE MENU */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="
            rounded-lg
            p-2
            text-slate-600
            transition

            hover:bg-slate-100
            hover:text-slate-900

            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white

            lg:hidden
          "
        >
          <Menu size={22} />
        </button>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <form
          onSubmit={handleSearchSubmit}
          className="
            hidden
            items-center
            sm:flex
          "
        >
          <div
            className="
              flex items-center gap-2
              rounded-lg
              bg-slate-100
              px-3 py-2
              transition

              focus-within:ring-2
              focus-within:ring-blue-500/30

              dark:bg-slate-800
            "
          >
            <Search
              size={17}
              className="
                shrink-0
                text-slate-400
                dark:text-slate-500
              "
            />

            <input
              type="text"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(
                  event.target.value,
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search anything..."
              aria-label="Search blogs"
              className="
                w-40
                bg-transparent
                text-sm
                text-slate-900
                outline-none
                placeholder:text-slate-400

                sm:w-52
                lg:w-64

                dark:text-white
                dark:placeholder:text-slate-500
              "
            />

            <kbd
              className="
                hidden
                rounded
                border
                border-slate-200
                bg-white
                px-2 py-0.5
                text-xs
                text-slate-400

                lg:block

                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-500
              "
            >
              /
            </kbd>
          </div>
        </form>

        {/* MOBILE TITLE */}
        <div className="sm:hidden">
          <p
            className="
              text-sm
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            TechNior Admin
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div
        className="
          flex
          items-center
          gap-2
          sm:gap-3
        "
      >
        {/* ===================================================
            DARK MODE
        =================================================== */}

        <button
          type="button"
          onClick={() =>
            setDarkMode(
              (current) => !current,
            )
          }
          title={
            darkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          aria-label={
            darkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          className="
            rounded-lg
            p-2.5
            text-slate-500
            transition

            hover:bg-slate-100
            hover:text-slate-900

            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
        >
          {darkMode ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setNotificationOpen(
                (current) => !current,
              )
            }
            aria-label="Notifications"
            aria-expanded={
              notificationOpen
            }
            className="
              relative
              rounded-lg
              p-2.5
              text-slate-500
              transition

              hover:bg-slate-100
              hover:text-slate-900

              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <Bell size={20} />

            {/* UNREAD DOT */}
{hasUnreadNotifications && (
  <span
    className="
      absolute
      right-2
      top-2
      h-2
      w-2
      rounded-full
      bg-red-500
      ring-2
      ring-white

      dark:ring-slate-950
    "
  />
)}
          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {notificationOpen && (
            <div
              className="
                absolute
                right-0
                top-14
                z-50
                w-[340px]
                max-w-[calc(100vw-2rem)]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
                shadow-slate-950/10

                dark:border-slate-700
                dark:bg-slate-900
                dark:shadow-black/30
              "
            >
              {/* ---------------------------------------------
                  NOTIFICATION HEADER
              ---------------------------------------------- */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-200
                  px-4
                  py-3

                  dark:border-slate-700
                "
              >
                <div>
                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Notifications
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    You have 3 new
                    notifications
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-2
                    py-1
                    text-xs
                    font-semibold
                    text-blue-600

                    dark:bg-blue-500/10
                    dark:text-blue-400
                  "
                >
                  3 New
                </span>
              </div>

              {/* ---------------------------------------------
                  NOTIFICATION LIST
              ---------------------------------------------- */}

              <div
                className="
                  max-h-[320px]
                  overflow-y-auto
                "
              >
                {notifications.map(
                  (notification) => (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      onClick={() =>
                        setNotificationOpen(
                          false,
                        )
                      }
                      className="
                        flex
                        w-full
                        gap-3
                        border-b
                        border-slate-100
                        px-4
                        py-4
                        text-left
                        transition

                        hover:bg-slate-50

                        dark:border-slate-800
                        dark:hover:bg-slate-800
                      "
                    >
                      {/* DOT */}
                      <span
                        className="
                          mt-1
                          h-2.5
                          w-2.5
                          shrink-0
                          rounded-full
                          bg-blue-500
                        "
                      />

                      {/* CONTENT */}
                      <span className="min-w-0">
                        <span
                          className="
                            block
                            text-sm
                            font-semibold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {
                            notification.title
                          }
                        </span>

                        <span
                          className="
                            mt-1
                            block
                            text-xs
                            leading-5
                            text-slate-500
                            dark:text-slate-400
                          "
                        >
                          {
                            notification.message
                          }
                        </span>

                        <span
                          className="
                            mt-1.5
                            block
                            text-[11px]
                            text-slate-400
                            dark:text-slate-500
                          "
                        >
                          {
                            notification.time
                          }
                        </span>
                      </span>
                    </button>
                  ),
                )}
              </div>

              {/* ---------------------------------------------
                  FOOTER
              ---------------------------------------------- */}

              <div
                className="
                  border-t
                  border-slate-200
                  p-3

                  dark:border-slate-700
                "
              >
                <button
                  type="button"
                 onClick={() => {
  setHasUnreadNotifications(false)
  setNotificationOpen(false)
}}
                  className="
                    w-full
                    rounded-lg
                    px-3
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    text-blue-600
                    transition

                    hover:bg-blue-50

                    dark:text-blue-400
                    dark:hover:bg-blue-500/10
                  "
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            DIVIDER
        =================================================== */}

        <div
          className="
            h-8
            w-px
            bg-slate-200
            dark:bg-slate-800
          "
        />

        {/* ===================================================
            USER
        =================================================== */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {/* USER IMAGE */}
          {user?.image ? (
            <img
              src={user.image}
              alt={fullName}
              className="
                h-10
                w-10
                rounded-full
                border-2
                border-white
                object-cover
                shadow-sm

                dark:border-slate-800
              "
            />
          ) : (
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-blue-600
                text-sm
                font-bold
                text-white
              "
            >
              {initials}
            </div>
          )}

          {/* USER NAME */}
          <div className="hidden sm:block">
            <p
              className="
                text-sm
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              {fullName}
            </p>

            <p
              className="
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header