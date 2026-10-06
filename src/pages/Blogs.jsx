import { useEffect, useMemo, useState } from 'react'

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'

import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import toast from 'react-hot-toast'
import { blogApi } from '../services/api'

function Blogs() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const [currentPage, setCurrentPage] = useState(1)

  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const itemsPerPage = 8

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

      // Blogs created from admin panel
      const createdBlogs = getCreatedBlogs()

      // Blogs edited from admin panel
      const updatedBlogs = getUpdatedBlogs()

      /*
       * DummyJSON PUT is not permanent.
       * Therefore localStorage keeps admin edits.
       */
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

      /*
       * Local created blogs first,
       * then API blogs with local edits applied.
       */
      setBlogs([
        ...createdBlogs,
        ...mergedApiBlogs,
      ])
    } catch (err) {
      console.error(err)

      // Even if API fails, show local blogs
      const createdBlogs = getCreatedBlogs()
      const updatedBlogs = getUpdatedBlogs()

      setBlogs([
        ...createdBlogs,
        ...updatedBlogs,
      ])

      setError(
        err.response?.data?.message ||
          'Unable to load blogs from API.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  fetchBlogs()
}, [])

useEffect(() => {
  const urlSearch = searchParams.get('search') || ''

  setSearch(urlSearch)
  setCurrentPage(1)
}, [searchParams])

  // =========================================================
  // BLOG HELPERS
  // =========================================================

  const getStatus = (blog) => {
    // Admin-created / edited blog
    if (blog.status) {
      return blog.status
    }

    // API blog
    return blog.id % 4 === 0
      ? 'Draft'
      : 'Published'
  }

  const getCategory = (blog) => {
    // Admin-created / edited blog
    if (blog.category) {
      return blog.category
    }

    // API blog
    if (blog.tags?.length) {
      return blog.tags[0]
    }

    return 'General'
  }

  const getAuthor = (blog) => {
    // Admin-created / edited blog
    if (blog.author) {
      return blog.author
    }

    // API blog
    return `Author #${blog.userId}`
  }

  const getDate = (blog) => {
    // Admin-created / edited blog
    if (blog.publishDate) {
      return new Date(
        blog.publishDate,
      ).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    }

    // API blog
    const date = new Date('2026-01-01')

    date.setDate(
      date.getDate() + (blog.id % 280),
    )

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getSlug = (blog) => {
    if (blog.slug) {
      return blog.slug
    }

    return (
      blog.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || ''
    )
  }

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const adminCategories = [
      'Technology',
      'AI & Machine Learning',
      'Web Development',
      'React',
      'JavaScript',
      'Backend',
      'Cloud',
      'DevOps',
      'Cybersecurity',
      'Programming',
    ]

    const apiCategories = blogs.map((blog) =>
      getCategory(blog),
    )

    return [
      'All',
      ...new Set([
        ...adminCategories,
        ...apiCategories,
      ]),
    ]
  }, [blogs])

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase()

    return blogs.filter((blog) => {
      const title =
        blog.title?.toLowerCase() || ''

      const author =
        getAuthor(blog).toLowerCase()

      const category =
        getCategory(blog).toLowerCase()

      const matchesSearch =
        !query ||
        title.includes(query) ||
        author.includes(query) ||
        category.includes(query)

      const matchesStatus =
        statusFilter === 'All' ||
        getStatus(blog) === statusFilter

      const matchesCategory =
        categoryFilter === 'All' ||
        getCategory(blog) === categoryFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      )
    })
  }, [
    blogs,
    search,
    statusFilter,
    categoryFilter,
  ])

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBlogs.length / itemsPerPage,
    ),
  )

  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // =========================================================
  // FILTER HANDLERS
  // =========================================================

  const handleSearch = (value) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value) => {
    setCategoryFilter(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setCategoryFilter('All')
    setCurrentPage(1)
  }

  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete = (id) => {
    setDeleteId(id)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)

      const createdBlogs = getCreatedBlogs()
      const updatedBlogs = getUpdatedBlogs()

      // Check if this is locally created
      const isLocalBlog = createdBlogs.some(
        (blog) =>
          String(blog.id) === String(deleteId),
      )

      if (isLocalBlog) {
        // Remove from createdBlogs
        const remainingCreatedBlogs =
          createdBlogs.filter(
            (blog) =>
              String(blog.id) !==
              String(deleteId),
          )

        localStorage.setItem(
          'createdBlogs',
          JSON.stringify(
            remainingCreatedBlogs,
          ),
        )

        // Also remove any possible update
        const remainingUpdatedBlogs =
          updatedBlogs.filter(
            (blog) =>
              String(blog.id) !==
              String(deleteId),
          )

        localStorage.setItem(
          'updatedBlogs',
          JSON.stringify(
            remainingUpdatedBlogs,
          ),
        )

        setBlogs((currentBlogs) =>
          currentBlogs.filter(
            (blog) =>
              String(blog.id) !==
              String(deleteId),
          ),
        )

        toast.success(
          'Blog deleted successfully.',
        )
      } else {
        // API delete
        await blogApi.deleteBlog(deleteId)

        /*
         * DummyJSON DELETE is also not permanent.
         * Therefore remove the ID from local updates
         * so it doesn't come back after refresh.
         */
        const remainingUpdatedBlogs =
          updatedBlogs.filter(
            (blog) =>
              String(blog.id) !==
              String(deleteId),
          )

        localStorage.setItem(
          'updatedBlogs',
          JSON.stringify(
            remainingUpdatedBlogs,
          ),
        )

        setBlogs((currentBlogs) =>
          currentBlogs.filter(
            (blog) =>
              String(blog.id) !==
              String(deleteId),
          ),
        )

        toast.success(
          'Blog deleted successfully.',
        )
      }

      setDeleteId(null)
    } catch (err) {
      console.error(err)

      toast.error(
        err.response?.data?.message ||
          'Failed to delete blog.',
      )
    } finally {
      setDeleting(false)
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Content</span>
            <span>/</span>

            <span className="font-medium text-slate-700 dark:text-slate-300">
              All Blogs
            </span>
          </div>

         <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Blog Management
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Create, manage and publish your blog content.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Refresh */}

          <button
            type="button"
            onClick={fetchBlogs}
            disabled={loading}
className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"          >
            <RefreshCw
              size={17}
              className={
                loading ? 'animate-spin' : ''
              }
            />

            Refresh
          </button>

          {/* Create */}

          <Link
            to="/blogs/create"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h3 className="font-semibold text-red-800">
                Failed to load blogs
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchBlogs}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors sm:p-5 dark:border-slate-800 dark:bg-slate-900">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          {/* Search */}

          <div className="relative w-full xl:max-w-md">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                handleSearch(e.target.value)
              }
              placeholder="Search by title, author or category..."
className=
"w-full rounded-xl border 
border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"            />

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Status */}

            <div className="relative">

              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value,
                  )
                }
className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-40"              >
                <option value="All">
                  All Status
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Draft">
                  Draft
                </option>
              </select>

            </div>

            {/* Category */}

            <select
              value={categoryFilter}
              onChange={(e) =>
                handleCategoryChange(
                  e.target.value,
                )
              }
className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-48"            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === 'All'
                    ? 'All Categories'
                    : category}
                </option>
              ))}
            </select>

            {/* Clear */}

            {(search ||
              statusFilter !== 'All' ||
              categoryFilter !== 'All') && (
              <button
                type="button"
                onClick={clearFilters}
className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"              >
                Clear
              </button>
            )}

          </div>
        </div>

        {/* Count */}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">

          <p className="text-sm text-slate-400">
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {filteredBlogs.length}
            </span>{' '}
            blogs
          </p>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            API connected
          </div>

        </div>
      </section>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">

        {/* Loading */}

        {loading ? (
          <div className="space-y-4 p-6">

            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ),
            )}

          </div>
        ) : paginatedBlogs.length === 0 ? (

          /* Empty */

          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              No blogs found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear filters
            </button>

          </div>

        ) : (

          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/60">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Blog
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Author
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {paginatedBlogs.map(
                    (blog) => {
                      const status =
                        getStatus(blog)

                      return (
                        <tr
                          key={blog.id}
                          className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >

                          {/* Blog */}

                          <td className="max-w-md px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FileEdit
                                  size={19}
                                />
                              </div>

                              <div className="min-w-0">

<p className="truncate font-semibold text-slate-800 dark:text-slate-100">                                  {blog.title}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                  /{getSlug(blog)}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Author */}

                          <td className="px-6 py-4 text-sm text-slate-300">
                            {getAuthor(blog)}
                          </td>

                          {/* Category */}

                          <td className="px-6 py-4">

                           <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {getCategory(blog)}
                            </span>

                          </td>

                          {/* Status */}

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                status ===
                                'Published'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-700'
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

                          {/* Date */}

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                            {getDate(blog)}
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-1">

                              {/* View */}

                              <button
                                type="button"
                                title="View"
                                onClick={() =>
                                  navigate(
                                    `/blogs/${blog.id}`,
                                  )
                                }
                               className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                              >
                                <Eye size={17} />
                              </button>

                              {/* Edit */}

                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  navigate(
                                    `/blogs/${blog.id}/edit`,
                                  )
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                              >
                                <FileEdit
                                  size={17}
                                />
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                title="Delete"
                                onClick={() =>
                                  confirmDelete(
                                    blog.id,
                                  )
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    },
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================== */}

            <div className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">

              {paginatedBlogs.map(
                (blog) => {
                  const status =
                    getStatus(blog)

                  return (
                    <div
                      key={blog.id}
                      className="p-5"
                    >

                      <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileEdit
                            size={19}
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="font-semibold text-slate-100">
                            {blog.title}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            {getAuthor(blog)} ·{' '}
                            {getCategory(blog)}
                          </p>

                          <div className="mt-3 flex items-center gap-2">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                status ===
                                'Published'
                                  ?'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              }`}
                            >
                              {status}
                            </span>

                            <span className="text-xs text-slate-400">
                              {getDate(blog)}
                            </span>

                          </div>

                        </div>

                        <MoreHorizontal
                          size={20}
                          className="text-slate-400"
                        />

                      </div>

                      <div className="mt-4 flex gap-2">

                        {/* View */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/blogs/${blog.id}`,
                            )
                          }
                          cclassName="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          View
                        </button>

                        {/* Edit */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/blogs/${blog.id}/edit`,
                            )
                          }
                          className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() =>
                            confirmDelete(
                              blog.id,
                            )
                          }
                          className="rounded-lg border border-red-100 px-3 py-2 text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </div>

                    </div>
                  )
                },
              )}

            </div>
          </>
        )}

        {/* =====================================================
            PAGINATION
        ====================================================== */}

        {!loading &&
          filteredBlogs.length > 0 && (
           <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <p className="text-sm text-slate-500">

                Page{' '}

                <span className="font-semibold text-slate-200">
                  {currentPage}
                </span>{' '}

                of{' '}

                <span className="font-semibold text-slate-200">
                  {totalPages}
                </span>

              </p>

              <div className="flex items-center gap-2">

                {/* Previous */}

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1,
                        ),
                    )
                  }
className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {/* Next */}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1,
                        ),
                    )
                  }
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>

              </div>

            </div>
          )}

      </section>

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-100">
              Delete this blog?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to
              delete this blog? This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              {/* Cancel */}

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteId(null)
                }
className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"              >
                Cancel
              </button>

              {/* Delete */}

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Blog'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default Blogs