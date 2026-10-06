import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  FileText,
  User,
  Tag,
  CalendarDays,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react'

import toast from 'react-hot-toast'

const API_URL = 'https://dummyjson.com/posts/add'

// =========================================================
// LIMITS
// =========================================================

const MAX_TITLE_LENGTH = 100
const MAX_SLUG_LENGTH = 120
const MAX_AUTHOR_LENGTH = 60
const MAX_SHORT_DESCRIPTION_LENGTH = 300
const MAX_CONTENT_LENGTH = 10000

const MIN_TITLE_LENGTH = 5
const MIN_SLUG_LENGTH = 3
const MIN_AUTHOR_LENGTH = 2
const MIN_SHORT_DESCRIPTION_LENGTH = 20
const MIN_CONTENT_LENGTH = 20

// =========================================================
// INITIAL FORM
// =========================================================

const initialForm = {
  title: '',
  slug: '',
  author: '',
  category: '',
  featuredImage: '',
  shortDescription: '',
  content: '',
  status: 'Draft',
  publishDate: '',
}

// =========================================================
// CATEGORIES
// =========================================================

const categories = [
  'Technology',
  'AI & Machine Learning',
  'Web Development',
  'Programming',
  'React',
  'JavaScript',
  'Backend',
  'Cloud',
  'DevOps',
  'Cybersecurity',
  'Business',
  'Design',
  'Tutorial',
  'News',
]

// =========================================================
// SLUG GENERATOR
// =========================================================

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, MAX_SLUG_LENGTH)
}

// =========================================================
// MEANINGFUL TEXT VALIDATION
// =========================================================

function hasAlphabeticCharacters(value) {
  return /[a-zA-Z]/.test(value)
}

function isOnlyRepeatedCharacter(value) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  if (!cleaned) {
    return true
  }

  return /^(.)(\1)+$/.test(cleaned)
}

function hasMeaningfulText(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return false
  }

  // Must contain at least 3 alphabetic characters
  const alphabeticCharacters =
    trimmed.match(/[a-zA-Z]/g) || []

  if (alphabeticCharacters.length < 3) {
    return false
  }

  // Reject aaaaaaaa / 111111 / xxxxxxxx etc.
  if (isOnlyRepeatedCharacter(trimmed)) {
    return false
  }

  return true
}

// =========================================================
// AUTHOR VALIDATION
// =========================================================

function isValidAuthor(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return false
  }

  // Names can contain letters, spaces, dot, apostrophe and hyphen.
  if (!/^[a-zA-Z][a-zA-Z\s.'-]*$/.test(trimmed)) {
    return false
  }

  if (!hasAlphabeticCharacters(trimmed)) {
    return false
  }

  if (isOnlyRepeatedCharacter(trimmed)) {
    return false
  }

  return true
}

// =========================================================
// CREATE BLOG
// =========================================================

function CreateBlog() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)

  const [errors, setErrors] = useState({})

  const [loading, setLoading] = useState(false)

  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    let nextValue = value

    // -----------------------------------------------
    // TITLE
    // -----------------------------------------------

    if (name === 'title') {
      nextValue = value.slice(
        0,
        MAX_TITLE_LENGTH,
      )
    }

    // -----------------------------------------------
    // SLUG
    // -----------------------------------------------

    if (name === 'slug') {
      nextValue = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .slice(0, MAX_SLUG_LENGTH)
    }

    // -----------------------------------------------
    // AUTHOR
    // -----------------------------------------------

    if (name === 'author') {
      nextValue = value.slice(
        0,
        MAX_AUTHOR_LENGTH,
      )
    }

    // -----------------------------------------------
    // DESCRIPTION
    // -----------------------------------------------

    if (name === 'shortDescription') {
      nextValue = value.slice(
        0,
        MAX_SHORT_DESCRIPTION_LENGTH,
      )
    }

    // -----------------------------------------------
    // CONTENT
    // -----------------------------------------------

    if (name === 'content') {
      nextValue = value.slice(
        0,
        MAX_CONTENT_LENGTH,
      )
    }

    // -----------------------------------------------
    // NORMAL STATE UPDATE
    // -----------------------------------------------

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }))

    // -----------------------------------------------
    // CLEAR ERROR WHILE TYPING
    // -----------------------------------------------

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // -----------------------------------------------
    // AUTO SLUG FROM TITLE
    // -----------------------------------------------

    if (name === 'title') {
      const generatedSlug =
        createSlug(nextValue)

      setForm((prev) => ({
        ...prev,
        title: nextValue,
        slug: generatedSlug,
      }))

      if (errors.slug) {
        setErrors((prev) => ({
          ...prev,
          slug: '',
        }))
      }
    }
  }

  // =======================================================
  // VALIDATE FORM
  // =======================================================

  const validateForm = () => {
    const newErrors = {}

    const title = form.title.trim()
    const slug = form.slug.trim()
    const author = form.author.trim()

    const shortDescription =
      form.shortDescription.trim()

    const content = form.content.trim()

    // =====================================================
    // TITLE
    // =====================================================

    if (!title) {
      newErrors.title =
        'Blog title is required.'
    } else if (
      title.length < MIN_TITLE_LENGTH
    ) {
      newErrors.title =
        `Title must contain at least ${MIN_TITLE_LENGTH} characters.`
    } else if (
      title.length > MAX_TITLE_LENGTH
    ) {
      newErrors.title =
        `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`
    } else if (
      !hasMeaningfulText(title)
    ) {
      newErrors.title =
        'Please enter a meaningful blog title.'
    }

    // =====================================================
    // SLUG
    // =====================================================

    if (!slug) {
      newErrors.slug =
        'Slug is required.'
    } else if (
      slug.length < MIN_SLUG_LENGTH
    ) {
      newErrors.slug =
        `Slug must contain at least ${MIN_SLUG_LENGTH} characters.`
    } else if (
      slug.length > MAX_SLUG_LENGTH
    ) {
      newErrors.slug =
        `Slug cannot exceed ${MAX_SLUG_LENGTH} characters.`
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        slug,
      )
    ) {
      newErrors.slug =
        'Slug can contain only lowercase letters, numbers and hyphens.'
    } else if (
      !hasAlphabeticCharacters(slug)
    ) {
      newErrors.slug =
        'Slug must contain meaningful text.'
    } else if (
      isOnlyRepeatedCharacter(slug)
    ) {
      newErrors.slug =
        'Please enter a meaningful slug.'
    }

    // =====================================================
    // AUTHOR
    // =====================================================

    if (!author) {
      newErrors.author =
        'Author name is required.'
    } else if (
      author.length < MIN_AUTHOR_LENGTH
    ) {
      newErrors.author =
        `Author name must contain at least ${MIN_AUTHOR_LENGTH} characters.`
    } else if (
      author.length > MAX_AUTHOR_LENGTH
    ) {
      newErrors.author =
        `Author name cannot exceed ${MAX_AUTHOR_LENGTH} characters.`
    } else if (!isValidAuthor(author)) {
      newErrors.author =
        'Please enter a valid author name.'
    }

    // =====================================================
    // CATEGORY
    // =====================================================

    if (!form.category) {
      newErrors.category =
        'Please select a category.'
    }

    // =====================================================
    // SHORT DESCRIPTION
    // =====================================================

    if (!shortDescription) {
      newErrors.shortDescription =
        'Short description is required.'
    } else if (
      shortDescription.length <
      MIN_SHORT_DESCRIPTION_LENGTH
    ) {
      newErrors.shortDescription =
        `Short description must contain at least ${MIN_SHORT_DESCRIPTION_LENGTH} characters.`
    } else if (
      shortDescription.length >
      MAX_SHORT_DESCRIPTION_LENGTH
    ) {
      newErrors.shortDescription =
        `Short description cannot exceed ${MAX_SHORT_DESCRIPTION_LENGTH} characters.`
    } else if (
      !hasMeaningfulText(shortDescription)
    ) {
      newErrors.shortDescription =
        'Please enter a meaningful short description.'
    }

    // =====================================================
    // CONTENT
    // =====================================================

    if (!content) {
      newErrors.content =
        'Blog content is required.'
    } else if (
      content.length < MIN_CONTENT_LENGTH
    ) {
      newErrors.content =
        `Blog content must contain at least ${MIN_CONTENT_LENGTH} characters.`
    } else if (
      content.length > MAX_CONTENT_LENGTH
    ) {
      newErrors.content =
        `Blog content cannot exceed ${MAX_CONTENT_LENGTH} characters.`
    } else if (
      !hasMeaningfulText(content)
    ) {
      newErrors.content =
        'Please enter meaningful blog content.'
    }

    // =====================================================
    // PUBLISH DATE
    // =====================================================

    if (!form.publishDate) {
      newErrors.publishDate =
        'Publish date is required.'
    }

    // =====================================================
    // FEATURED IMAGE
    // =====================================================

    if (form.featuredImage.trim()) {
      try {
        const imageUrl = new URL(
          form.featuredImage.trim(),
        )

        if (
          !['http:', 'https:'].includes(
            imageUrl.protocol,
          )
        ) {
          newErrors.featuredImage =
            'Please enter a valid image URL.'
        }
      } catch {
        newErrors.featuredImage =
          'Please enter a valid image URL.'
      }
    }

    // =====================================================
    // SET ERRORS
    // =====================================================

    setErrors(newErrors)

    return (
      Object.keys(newErrors).length === 0
    )
  }

  // =======================================================
  // SUBMIT BLOG
  // =======================================================

  const submitBlog = async (status) => {
  const selectedStatus =
    status === 'Draft'
      ? 'Draft'
      : 'Published'

  const isValid = validateForm()

  if (!isValid) {
    toast.error(
      'Please fix the highlighted fields.',
    )
    return
  }

  setLoading(true)

  try {
    console.log(
      'SUBMIT STATUS:',
      selectedStatus,
    )

    const payload = {
      title: form.title.trim(),
      body: form.content.trim(),
      userId: 1,

      slug: form.slug.trim(),
      author: form.author.trim(),
      category: form.category,
      featuredImage:
        form.featuredImage.trim(),
      shortDescription:
        form.shortDescription.trim(),
      content: form.content.trim(),

      // IMPORTANT
      status: selectedStatus,

      publishDate: form.publishDate,
    }

    console.log(
      'PAYLOAD STATUS:',
      payload.status,
    )

    const response = await axios.post(
      API_URL,
      payload,
    )

    console.log(
      'Create blog response:',
      response.data,
    )

    const existingBlogs = JSON.parse(
      localStorage.getItem(
        'createdBlogs',
      ) || '[]',
    )

    const newBlog = {
      ...response.data,

      ...payload,

      // IMPORTANT:
      // force our selected status
      status: selectedStatus,

      id:
        response.data.id ||
        Date.now(),
    }

    console.log(
      'FINAL BLOG STATUS:',
      newBlog.status,
    )

    localStorage.setItem(
      'createdBlogs',
      JSON.stringify([
        newBlog,
        ...existingBlogs,
      ]),
    )

    toast.success(
      selectedStatus === 'Published'
        ? 'Blog published successfully!'
        : 'Blog saved as draft!',
    )

    setTimeout(() => {
      navigate('/blogs')
    }, 700)
  } catch (error) {
    console.error(
      'Create blog error:',
      error,
    )

    toast.error(
      error?.response?.data?.message ||
        'Unable to create blog. Please try again.',
    )
  } finally {
    setLoading(false)
  }
}

  // =======================================================
  // FORM SUBMIT
  // =======================================================

  const handleSubmit = (e) => {
    e.preventDefault()

  }

  // =======================================================
  // INPUT CLASS
  // =======================================================

  const inputClass = (field) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition
  placeholder:text-slate-400
  dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500
  focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
  ${
    errors[field]
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
      : 'border-slate-200'
  }`

  // =======================================================
  // UI
  // =======================================================

  return (
  <div className="min-h-full bg-slate-100 p-4 transition-colors duration-200 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate('/blogs')
            }
           className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400"
          >
            <ArrowLeft size={17} />

            Back to Blogs
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Content</span>

                <span>/</span>

                <span>Create Blog</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create Blog
              </h1>

             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Create, edit and publish a new
                blog article.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate('/blogs')
                }
className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  submitBlog('Draft')
                }
className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                Save Draft
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  submitBlog('Published')
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}

                Publish
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="space-y-6 xl:col-span-2">

              {/* ===============================================
                  BLOG INFORMATION
              ================================================ */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Blog Information
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Add the basic information
                      for your article.
                    </p>
                  </div>
                </div>

                {/* TITLE */}

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Blog Title{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={
                      MAX_TITLE_LENGTH
                    }
                    placeholder="Enter an engaging blog title"
                    className={inputClass(
                      'title',
                    )}
                  />

                  <div className="mt-1.5 flex items-start justify-between gap-3">
                    <div>
                      {errors.title && (
                        <p className="text-xs text-red-500">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 text-xs ${
                        form.title.length >=
                        MAX_TITLE_LENGTH
                          ? 'font-semibold text-red-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {form.title.length}/
                      {MAX_TITLE_LENGTH}
                    </span>
                  </div>
                </div>

                {/* SLUG + AUTHOR */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* SLUG */}

                  <div>
                   <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <LinkIcon size={15} />

                      Slug{' '}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      maxLength={
                        MAX_SLUG_LENGTH
                      }
                      placeholder="blog-title-example"
                      className={inputClass(
                        'slug',
                      )}
                    />

                    <div className="mt-1.5 flex items-start justify-between gap-3">
                      <div>
                        {errors.slug && (
                          <p className="text-xs text-red-500">
                            {errors.slug}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 text-xs ${
                          form.slug.length >=
                          MAX_SLUG_LENGTH
                            ? 'font-semibold text-red-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {form.slug.length}/
                        {MAX_SLUG_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* AUTHOR */}

                  <div>
                   <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <User size={15} />

                      Author{' '}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="author"
                      value={form.author}
                      onChange={handleChange}
                      maxLength={
                        MAX_AUTHOR_LENGTH
                      }
                      placeholder="Enter author name"
                      className={inputClass(
                        'author',
                      )}
                    />

                    <div className="mt-1.5 flex items-start justify-between gap-3">
                      <div>
                        {errors.author && (
                          <p className="text-xs text-red-500">
                            {errors.author}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 text-xs ${
                          form.author.length >=
                          MAX_AUTHOR_LENGTH
                            ? 'font-semibold text-red-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {form.author.length}/
                        {MAX_AUTHOR_LENGTH}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5">
                 <h2 className="font-semibold text-slate-900 dark:text-white">
                    Description
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Write a short summary that
                    explains what the article is
                    about.
                  </p>
                </div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Short Description{' '}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  name="shortDescription"
                  value={
                    form.shortDescription
                  }
                  onChange={handleChange}
                  rows={4}
                  maxLength={
                    MAX_SHORT_DESCRIPTION_LENGTH
                  }
                  placeholder="Write a short description for your blog..."
                  className={`${inputClass(
                    'shortDescription',
                  )} resize-none`}
                />

                <div className="mt-2 flex items-start justify-between gap-3">
                  <div>
                    {errors.shortDescription ? (
                      <p className="text-xs text-red-500">
                        {
                          errors.shortDescription
                        }
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Minimum{' '}
                        {
                          MIN_SHORT_DESCRIPTION_LENGTH
                        }{' '}
                        characters
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 text-xs ${
                      form.shortDescription
                        .length >=
                      MAX_SHORT_DESCRIPTION_LENGTH
                        ? 'font-semibold text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {
                      form.shortDescription
                        .length
                    }
                    /
                    {
                      MAX_SHORT_DESCRIPTION_LENGTH
                    }
                  </span>
                </div>
              </div>

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5">
                 <h2 className="font-semibold text-slate-900 dark:text-white">
                    Blog Content
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Write the complete content
                    of your blog post.
                  </p>
                </div>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={15}
                  maxLength={
                    MAX_CONTENT_LENGTH
                  }
                  placeholder="Start writing your blog content..."
                  className={`${inputClass(
                    'content',
                  )} resize-y leading-7`}
                />

                <div className="mt-2 flex items-start justify-between gap-3">
                  <div>
                    {errors.content ? (
                      <p className="text-xs text-red-500">
                        {errors.content}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Minimum{' '}
                        {MIN_CONTENT_LENGTH}{' '}
                        characters
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 text-xs ${
                      form.content.length >=
                      MAX_CONTENT_LENGTH
                        ? 'font-semibold text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {form.content.length}/
                    {MAX_CONTENT_LENGTH}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <div className="space-y-6">

              {/* PUBLISHING */}

<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Send size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Publishing
                    </h2>

                    <p className="text-xs text-slate-500">
                      Manage publication settings.
                    </p>
                  </div>
                </div>

              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass(
                    'status',
                  )}
                >
                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>
                </select>

                <div className="mt-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <CalendarDays size={15} />

                    Publish Date{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    name="publishDate"
                    value={form.publishDate}
                    onChange={handleChange}
                    className={inputClass(
                      'publishDate',
                    )}
                  />

                  {errors.publishDate && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.publishDate}
                    </p>
                  )}
                </div>
              </div>

              {/* CATEGORY */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Tag size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Category
                    </h2>

                    <p className="text-xs text-slate-500">
                      Organize your article.
                    </p>
                  </div>
                </div>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass(
                    'category',
                  )}
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ),
                  )}
                </select>

                {errors.category && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* FEATURED IMAGE */}

             <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <ImageIcon size={19} />
                  </div>

                  <div>
                   <h2 className="font-semibold text-slate-900 dark:text-white">
                      Featured Image
                    </h2>

                    <p className="text-xs text-slate-500">
                      Add an image URL for your
                      article.
                    </p>
                  </div>
                </div>

                <input
                  type="url"
                  name="featuredImage"
                  value={
                    form.featuredImage
                  }
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass(
                    'featuredImage',
                  )}
                />

                {errors.featuredImage && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.featuredImage}
                  </p>
                )}

                {form.featuredImage &&
                  !errors.featuredImage && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={
                          form.featuredImage
                        }
                        alt="Featured preview"
                        className="h-40 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            'none'
                        }}
                      />
                    </div>
                  )}
              </div>

              {/* CHECKLIST */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Publishing checklist
                </p>

               <ul className="mt-3 space-y-2 text-xs text-blue-800 dark:text-blue-300">
                  <li>
                    ✓ Add a meaningful title
                  </li>

                  <li>
                    ✓ Use a valid author name
                  </li>

                  <li>
                    ✓ Select a category
                  </li>

                  <li>
                    ✓ Add a meaningful short
                    description
                  </li>

                  <li>
                    ✓ Write meaningful blog
                    content
                  </li>

                  <li>
                    ✓ Select publication status
                  </li>

                  <li>
                    ✓ Add a publish date
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBlog