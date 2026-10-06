import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  FileText,
  Eye,
  RefreshCw,
  TrendingUp,
  Plus,
  CalendarDays,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { blogApi } from '../services/api'

function Dashboard() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // LOCAL STORAGE HELPERS
  // =========================================================

  const getCreatedBlogs = () => {
    try {
      return JSON.parse(
        localStorage.getItem('createdBlogs') || '[]',
      )
    } catch {
      return []
    }
  }

  const getUpdatedBlogs = () => {
    try {
      return JSON.parse(
        localStorage.getItem('updatedBlogs') || '[]',
      )
    } catch {
      return []
    }
  }

  const getDeletedBlogIds = () => {
    try {
      return JSON.parse(
        localStorage.getItem('deletedBlogIds') || '[]',
      )
    } catch {
      return []
    }
  }

  // =========================================================
  // BLOG HELPERS
  // =========================================================

  const getStatus = (blog) => {
    if (blog.status) {
      return blog.status
    }

    return Number(blog.id) % 4 === 0
      ? 'Draft'
      : 'Published'
  }

  const getCategory = (blog) => {
    if (blog.category) {
      return blog.category
    }

    if (blog.tags?.length) {
      return blog.tags[0]
    }

    return 'General'
  }

  const getAuthor = (blog) => {
    if (blog.author) {
      return blog.author
    }

    if (blog.userId) {
      return `Author #${blog.userId}`
    }

    return 'Admin'
  }

  const getDate = (blog) => {
    if (blog.publishDate) {
      const date = new Date(blog.publishDate)

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      }
    }

    const numericId = Number(blog.id) || 1
    const date = new Date('2026-01-01')

    date.setDate(
      date.getDate() + (numericId % 280),
    )

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // =========================================================
  // LOAD BLOGS
  // =========================================================

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await blogApi.getBlogs({
        limit: 0,
      })

      const apiBlogs = response.data.posts || []

      const createdBlogs = getCreatedBlogs()
      const updatedBlogs = getUpdatedBlogs()
      const deletedBlogIds = getDeletedBlogIds()

      const mergedApiBlogs = apiBlogs.map((blog) => {
        const updatedBlog = updatedBlogs.find(
          (item) =>
            String(item.id) === String(blog.id),
        )

        return updatedBlog
          ? {
              ...blog,
              ...updatedBlog,
            }
          : blog
      })

      const visibleApiBlogs = mergedApiBlogs.filter(
        (blog) =>
          !deletedBlogIds.includes(
            String(blog.id),
          ),
      )

      const visibleCreatedBlogs =
        createdBlogs.filter(
          (blog) =>
            !deletedBlogIds.includes(
              String(blog.id),
            ),
        )

      setBlogs([
        ...visibleCreatedBlogs,
        ...visibleApiBlogs,
      ])
    } catch (err) {
      console.error(
        'Dashboard blog loading error:',
        err,
      )

      const createdBlogs = getCreatedBlogs()
      const updatedBlogs = getUpdatedBlogs()
      const deletedBlogIds = getDeletedBlogIds()

      const localBlogs = [
        ...createdBlogs,
        ...updatedBlogs,
      ]
        .filter(
          (blog, index, array) =>
            array.findIndex(
              (item) =>
                String(item.id) ===
                String(blog.id),
            ) === index,
        )
        .filter(
          (blog) =>
            !deletedBlogIds.includes(
              String(blog.id),
            ),
        )

      setBlogs(localBlogs)

      setError(
        err?.response?.data?.message ||
          'Unable to load dashboard data.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const totalBlogs = blogs.length

    const publishedBlogs = blogs.filter(
      (blog) =>
        getStatus(blog) === 'Published',
    ).length

    const draftBlogs = blogs.filter(
      (blog) =>
        getStatus(blog) === 'Draft',
    ).length

    const totalViews = blogs.reduce(
      (total, blog) =>
        total + Number(blog.views || 0),
      0,
    )

    return {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews,
    }
  }, [blogs])

  // =========================================================
  // RECENT BLOGS
  // =========================================================

  const recentBlogs = useMemo(() => {
    return [...blogs]
      .sort((a, b) => {
        const dateA = new Date(
          a.publishDate || 0,
        ).getTime()

        const dateB = new Date(
          b.publishDate || 0,
        ).getTime()

        if (
          !Number.isNaN(dateA) &&
          !Number.isNaN(dateB) &&
          dateA !== dateB
        ) {
          return dateB - dateA
        }

        return (
          Number(b.id || 0) -
          Number(a.id || 0)
        )
      })
      .slice(0, 5)
  }, [blogs])

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      title: 'Total Blogs',
      value: statistics.totalBlogs,
      description: 'All blog posts',
      icon: FileText,
      iconWrapper:
        'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      valueColor:
        'text-slate-900 dark:text-white',
    },
    {
      title: 'Published',
      value: statistics.publishedBlogs,
      description: 'Live blog posts',
      icon: Activity,
      iconWrapper:
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      valueColor:
        'text-emerald-700 dark:text-emerald-400',
    },
    {
      title: 'Drafts',
      value: statistics.draftBlogs,
      description: 'Pending publication',
      icon: BarChart3,
      iconWrapper:
        'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      valueColor:
        'text-amber-700 dark:text-amber-400',
    },
    {
      title: 'Total Views',
      value: statistics.totalViews.toLocaleString(
        'en-IN',
      ),
      description: 'Across all blogs',
      icon: Eye,
      iconWrapper:
        'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
      valueColor:
        'text-violet-700 dark:text-violet-400',
    },
  ]

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

            <div className="mt-3 h-9 w-52 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-2 dark:border-slate-800 dark:bg-slate-900" />

          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        </div>
      </div>
    )
  }

  // =========================================================
  // DASHBOARD UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Overview</span>

            <span>/</span>

            <span className="font-medium text-slate-700 dark:text-slate-300">
              Dashboard
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor your blog content and publishing
            activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBlogs}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={17}
              className={
                loading ? 'animate-spin' : ''
              }
            />

            Refresh
          </button>

          <Link
            to="/blogs/create"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Create Blog
          </Link>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 dark:hover:bg-slate-900/90"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconWrapper}`}
                >
                  <Icon size={22} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-slate-300 transition group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400"
                />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>

                <p
                  className={`mt-1 text-3xl font-bold tracking-tight ${card.valueColor}`}
                >
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {card.description}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-3">
        {/* ===================================================
            RECENT BLOGS
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Blogs
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest content in your blog management
                panel.
              </p>
            </div>

            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {recentBlogs.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <FileText size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
                No blogs available
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Create your first blog post to see it
                here.
              </p>

              <Link
                to="/blogs/create"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Create Blog
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/60">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Blog
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentBlogs.map((blog) => {
                      const status =
                        getStatus(blog)

                      return (
                        <tr
                          key={blog.id}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <td className="max-w-sm px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                <FileText
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0">
                                <Link
                                  to={`/blogs/${blog.id}`}
                                  className="block truncate font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                                >
                                  {blog.title ||
                                    'Untitled Blog'}
                                </Link>

                                <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                                  {getAuthor(blog)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {getCategory(blog)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                status ===
                                'Published'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  status ===
                                  'Published'
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                              />

                              {status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {getDate(blog)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
                {recentBlogs.map((blog) => {
                  const status =
                    getStatus(blog)

                  return (
                    <Link
                      key={blog.id}
                      to={`/blogs/${blog.id}`}
                      className="block p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-slate-800 dark:text-slate-200">
                            {blog.title ||
                              'Untitled Blog'}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {getAuthor(blog)} ·{' '}
                            {getCategory(blog)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                status ===
                                'Published'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  status ===
                                  'Published'
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                              />

                              {status}
                            </span>

                            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <CalendarDays
                                size={13}
                              />

                              {getDate(blog)}
                            </span>
                          </div>
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="shrink-0 text-slate-300 dark:text-slate-600"
                        />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ===================================================
            CONTENT OVERVIEW
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Content Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Current publishing status.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>

          {/* Published */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Published
              </span>

              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {statistics.publishedBlogs}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width:
                    statistics.totalBlogs > 0
                      ? `${
                          (statistics.publishedBlogs /
                            statistics.totalBlogs) *
                          100
                        }%`
                      : '0%',
                }}
              />
            </div>
          </div>

          {/* Draft */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Drafts
              </span>

              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {statistics.draftBlogs}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{
                  width:
                    statistics.totalBlogs > 0
                      ? `${
                          (statistics.draftBlogs /
                            statistics.totalBlogs) *
                          100
                        }%`
                      : '0%',
                }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Content
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {statistics.totalBlogs}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Views
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {statistics.totalViews.toLocaleString(
                  'en-IN',
                )}
              </p>
            </div>
          </div>

          {/* Quick action */}
          <Link
            to="/blogs"
            className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          >
            <span>Manage all blogs</span>

            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          BOTTOM QUICK ACTIONS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/blogs/create"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 dark:hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Plus size={21} />
            </div>

            <ArrowUpRight
              size={18}
              className="text-slate-300 transition group-hover:text-blue-500 dark:text-slate-600"
            />
          </div>

          <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
            Create a new blog
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Write and publish a new article.
          </p>
        </Link>

        <Link
          to="/blogs"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 dark:hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <FileText size={21} />
            </div>

            <ArrowUpRight
              size={18}
              className="text-slate-300 transition group-hover:text-violet-500 dark:text-slate-600"
            />
          </div>

          <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
            Manage content
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search, filter, edit and delete blogs.
          </p>
        </Link>

        <Link
          to="/blogs"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 dark:hover:border-blue-500/40 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <BarChart3 size={21} />
            </div>

            <ArrowUpRight
              size={18}
              className="text-slate-300 transition group-hover:text-emerald-500 dark:text-slate-600"
            />
          </div>

          <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
            Publishing status
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {statistics.publishedBlogs} published ·{' '}
            {statistics.draftBlogs} drafts
          </p>
        </Link>
      </section>
    </div>
  )
}

export default Dashboard