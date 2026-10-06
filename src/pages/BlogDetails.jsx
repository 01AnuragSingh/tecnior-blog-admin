import { useEffect, useState } from 'react'

import {
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Tag,
} from 'lucide-react'

import { useNavigate, useParams } from 'react-router-dom'
import { blogApi } from '../services/api'

function BlogDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true)
        setError('')

        // =====================================================
        // 1. CREATED BLOGS
        // =====================================================

        let createdBlogs = []

        try {
          createdBlogs = JSON.parse(
            localStorage.getItem('createdBlogs') || '[]',
          )
        } catch {
          createdBlogs = []
        }

        let foundBlog = createdBlogs.find(
          (item) => String(item.id) === String(id),
        )

        // =====================================================
        // 2. UPDATED BLOGS
        // =====================================================

        let updatedBlogs = []

        try {
          updatedBlogs = JSON.parse(
            localStorage.getItem('updatedBlogs') || '[]',
          )
        } catch {
          updatedBlogs = []
        }

        const updatedBlog = updatedBlogs.find(
          (item) => String(item.id) === String(id),
        )

        // If created blog exists, apply its latest update
        if (foundBlog && updatedBlog) {
          foundBlog = {
            ...foundBlog,
            ...updatedBlog,
          }
        }

        // =====================================================
        // 3. API BLOG
        // =====================================================

        if (!foundBlog) {
          const response = await blogApi.getBlogs({
            limit: 0,
          })

          const apiBlogs = response.data.posts || []

          foundBlog = apiBlogs.find(
            (item) => String(item.id) === String(id),
          )

          // Apply locally saved edit to API blog
          if (foundBlog && updatedBlog) {
            foundBlog = {
              ...foundBlog,
              ...updatedBlog,
            }
          }
        }

        // =====================================================
        // 4. NOT FOUND
        // =====================================================

        if (!foundBlog) {
          setError('Blog not found.')
          setBlog(null)
          return
        }

        setBlog(foundBlog)
      } catch (err) {
        console.error(
          'Failed to load blog:',
          err,
        )

        setError(
          err.response?.data?.message ||
            'Unable to load blog details.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadBlog()
  }, [id])

  // ===========================================================
  // STATUS
  // ===========================================================

  const getStatus = () => {
    if (blog?.status) {
      return blog.status
    }

    return Number(blog?.id) % 4 === 0
      ? 'Draft'
      : 'Published'
  }

  // ===========================================================
  // CATEGORY
  // ===========================================================

  const getCategory = () => {
    if (blog?.category) {
      return blog.category
    }

    if (blog?.tags?.length) {
      return blog.tags[0]
    }

    return 'General'
  }

  // ===========================================================
  // AUTHOR
  // ===========================================================

  const getAuthor = () => {
    if (blog?.author) {
      return blog.author
    }

    if (blog?.userId) {
      return `Author #${blog.userId}`
    }

    return 'Unknown Author'
  }

  // ===========================================================
  // DATE
  // ===========================================================

  const getDate = () => {
    if (blog?.publishDate) {
      return new Date(
        blog.publishDate,
      ).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    }

    if (blog?.id) {
      const date = new Date('2026-01-01')

      date.setDate(
        date.getDate() +
          (Number(blog.id) % 280),
      )

      return date.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      )
    }

    return 'Date unavailable'
  }

  // ===========================================================
  // DESCRIPTION
  // ===========================================================

  const getDescription = () => {
    if (blog?.description) {
      return blog.description
    }

    if (blog?.body) {
      return blog.body.length > 180
        ? `${blog.body.substring(0, 180)}...`
        : blog.body
    }

    return 'No description available for this blog.'
  }

  // ===========================================================
  // CONTENT
  // ===========================================================

  const getContent = () => {
    if (blog?.content) {
      return blog.content
    }

    if (blog?.body) {
      return blog.body
    }

    return 'No content available for this blog.'
  }

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="space-y-5">

            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />

            <div className="h-10 w-2/3 animate-pulse rounded bg-slate-200" />

            <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />

            <div className="h-px bg-slate-100" />

            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />

            <div className="h-20 w-full animate-pulse rounded bg-slate-100" />

            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />

            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
            </div>

          </div>

        </section>
      </div>
    )
  }

  // ===========================================================
  // ERROR / NOT FOUND
  // ===========================================================

  if (error || !blog) {
    return (
      <div className="space-y-6">

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Content</span>
            <span>/</span>
            <span>All Blogs</span>
            <span>/</span>
            <span className="font-medium text-slate-700">
              Blog Details
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Blog Details
          </h1>
        </div>

        <section className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FileText
              size={28}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Blog not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              'The requested blog does not exist.'}
          </p>

          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Blogs
          </button>

        </section>
      </div>
    )
  }

  const status = getStatus()
  const category = getCategory()
  const author = getAuthor()
  const date = getDate()
  const description = getDescription()
  const content = getContent()

  // ===========================================================
  // UI
  // ===========================================================

  return (
    <div className="space-y-6">

      {/* Header */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Content</span>
            <span>/</span>
            <span>All Blogs</span>
            <span>/</span>
            <span className="font-medium text-slate-700">
              Blog Details
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Blog Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete information about this blog post.
          </p>

        </div>

        <button
          type="button"
          onClick={() => navigate('/blogs')}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back to Blogs
        </button>

      </section>

      {/* Blog Details */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Blog Header */}

        <div className="p-5 sm:p-8">

          {/* Status */}

          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              status === 'Published'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === 'Published'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />

            {status}
          </span>

          {/* Title */}

          <h2 className="mt-4 break-words text-2xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {blog.title}
          </h2>

          {/* Meta */}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">

            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{author}</span>
            </div>

            <div className="flex items-center gap-2">
              <Tag size={16} />
              <span>{category}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{date}</span>
            </div>

          </div>

        </div>

        {/* Divider */}

        <div className="mx-5 h-px bg-slate-100 sm:mx-8" />

        {/* Description */}

        <div className="p-5 sm:p-8">

          <h3 className="text-lg font-bold text-slate-900">
            Description
          </h3>

          <p className="mt-3 break-words leading-7 text-slate-600">
            {description}
          </p>

        </div>

        {/* Content */}

        <div className="border-t border-slate-100 p-5 sm:p-8">

          <h3 className="text-lg font-bold text-slate-900">
            Blog Content
          </h3>

          <div className="mt-4 whitespace-pre-line break-words leading-8 text-slate-600">
            {content}
          </div>

        </div>

      </section>

    </div>
  )
}

export default BlogDetails