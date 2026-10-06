import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const API_BASE_URL = 'https://dummyjson.com/posts'

// =========================================================
// VALIDATION LIMITS
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
  'React',
  'JavaScript',
  'Backend',
  'Cloud',
  'DevOps',
  'Cybersecurity',
  'Programming',
  'News',
  'Business',
  'Design',
  'Tutorial',
]

// =========================================================
// DATE HELPERS
// =========================================================

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    today.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDateForInput(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

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

  const alphabeticCharacters =
    trimmed.match(/[a-zA-Z]/g) || []

  if (alphabeticCharacters.length < 3) {
    return false
  }

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

  if (
    !/^[a-zA-Z][a-zA-Z\s.'-]*$/.test(
      trimmed,
    )
  ) {
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
// EDIT BLOG
// =========================================================

function EditBlog() {
  const navigate = useNavigate()

  const { id } = useParams()

  const [form, setForm] = useState(initialForm)

  const [errors, setErrors] = useState({})

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const today = getTodayDate()

  // =======================================================
  // LOAD BLOG
  // =======================================================

  useEffect(() => {
    loadBlog()
  }, [id])

  const loadBlog = async () => {
    try {
      setLoading(true)

      // ---------------------------------------------------
      // CHECK ADMIN CREATED BLOGS
      // ---------------------------------------------------

      const createdBlogs = JSON.parse(
        localStorage.getItem(
          'createdBlogs',
        ) || '[]',
      )

      const localBlog = createdBlogs.find(
        (blog) =>
          String(blog.id) === String(id),
      )

      if (localBlog) {
        setForm({
          title: localBlog.title || '',

          slug:
            localBlog.slug ||
            createSlug(
              localBlog.title || '',
            ),

          author: localBlog.author || '',

          category:
            localBlog.category || '',

          featuredImage:
            localBlog.featuredImage || '',

          shortDescription:
            localBlog.shortDescription || '',

          content:
            localBlog.content ||
            localBlog.body ||
            '',

          status:
            localBlog.status || 'Draft',

          publishDate:
            formatDateForInput(
              localBlog.publishDate,
            ),
        })

        return
      }

      // ---------------------------------------------------
      // LOAD API BLOG
      // ---------------------------------------------------

      const response = await axios.get(
        `${API_BASE_URL}/${id}`,
      )

      const blog = response.data

      // ---------------------------------------------------
      // CHECK LOCAL OVERRIDES
      // ---------------------------------------------------

      const existingOverrides =
        JSON.parse(
          localStorage.getItem(
            'updatedBlogs',
          ) || '[]',
        )

      const override =
        existingOverrides.find(
          (item) =>
            String(item.id) ===
            String(id),
        )

      const finalBlog = override
        ? {
            ...blog,
            ...override,
          }
        : blog

      setForm({
        title: finalBlog.title || '',

        slug:
          finalBlog.slug ||
          createSlug(
            finalBlog.title || '',
          ),

        author:
          finalBlog.author ||
          `Author #${
            finalBlog.userId || ''
          }`,

        category:
          finalBlog.category ||
          finalBlog.tags?.[0] ||
          'General',

        featuredImage:
          finalBlog.featuredImage || '',

        shortDescription:
          finalBlog.shortDescription ||
          finalBlog.body ||
          '',

        content:
          finalBlog.content ||
          finalBlog.body ||
          '',

        status:
          finalBlog.status ||
          'Published',

        publishDate:
          formatDateForInput(
            finalBlog.publishDate,
          ),
      })
    } catch (error) {
      console.error(
        'Load blog error:',
        error,
      )

      toast.error(
        'Unable to load this blog.',
      )

      navigate('/blogs')
    } finally {
      setLoading(false)
    }
  }

  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    let nextValue = value

    // ---------------------------------------------------
    // TITLE
    // ---------------------------------------------------

    if (name === 'title') {
      nextValue = value.slice(
        0,
        MAX_TITLE_LENGTH,
      )
    }

    // ---------------------------------------------------
    // SLUG
    // ---------------------------------------------------

    if (name === 'slug') {
      nextValue = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .slice(0, MAX_SLUG_LENGTH)
    }

    // ---------------------------------------------------
    // AUTHOR
    // ---------------------------------------------------

    if (name === 'author') {
      nextValue = value.slice(
        0,
        MAX_AUTHOR_LENGTH,
      )
    }

    // ---------------------------------------------------
    // DESCRIPTION
    // ---------------------------------------------------

    if (name === 'shortDescription') {
      nextValue = value.slice(
        0,
        MAX_SHORT_DESCRIPTION_LENGTH,
      )
    }

    // ---------------------------------------------------
    // CONTENT
    // ---------------------------------------------------

    if (name === 'content') {
      nextValue = value.slice(
        0,
        MAX_CONTENT_LENGTH,
      )
    }

    // ---------------------------------------------------
    // STATUS
    // ---------------------------------------------------

    if (name === 'status') {
      setForm((prev) => ({
        ...prev,
        status: value,
      }))

      if (errors.status) {
        setErrors((prev) => ({
          ...prev,
          status: '',
        }))
      }

      // If switching to Draft, a future date
      // is allowed, so clear the date error.
      if (value === 'Draft') {
        setErrors((prev) => ({
          ...prev,
          publishDate: '',
        }))
      }

      // If switching to Published and the
      // existing date is future, show error.
      if (
        value === 'Published' &&
        form.publishDate &&
        form.publishDate > today
      ) {
        setErrors((prev) => ({
          ...prev,
          publishDate:
            'Published blogs cannot have a future publish date.',
        }))
      }

      return
    }

    // ---------------------------------------------------
    // UPDATE STATE
    // ---------------------------------------------------

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }))

    // ---------------------------------------------------
    // CLEAR FIELD ERROR
    // ---------------------------------------------------

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // ---------------------------------------------------
    // AUTO SLUG
    // ---------------------------------------------------

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

    // ---------------------------------------------------
    // PUBLISH DATE
    // ---------------------------------------------------

    if (name === 'publishDate') {
      if (
        form.status === 'Published' &&
        nextValue > today
      ) {
        setErrors((prev) => ({
          ...prev,
          publishDate:
            'Published blogs cannot have a future publish date.',
        }))
      }
    }
  }

  // =======================================================
  // VALIDATE FORM
  // =======================================================

  const validateForm = (status) => {
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
    // DESCRIPTION
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
    } else if (
      status === 'Published' &&
      form.publishDate > today
    ) {
      newErrors.publishDate =
        'Published blogs cannot have a future publish date.'
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
    // SAVE ERRORS
    // =====================================================

    setErrors(newErrors)

    return (
      Object.keys(newErrors).length === 0
    )
  }

  // =======================================================
  // SAVE BLOG
  // =======================================================

  const saveBlog = async (status) => {
    if (!validateForm(status)) {
      toast.error(
        'Please fix the highlighted fields.',
      )

      return
    }

    try {
      setSaving(true)

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

        status,

        publishDate: form.publishDate,
      }

      // ===================================================
      // CHECK LOCAL CREATED BLOG
      // ===================================================

      const createdBlogs = JSON.parse(
        localStorage.getItem(
          'createdBlogs',
        ) || '[]',
      )

      const localIndex =
        createdBlogs.findIndex(
          (blog) =>
            String(blog.id) ===
            String(id),
        )

      if (localIndex !== -1) {
        const updatedBlog = {
          ...createdBlogs[localIndex],
          ...payload,
          id: createdBlogs[localIndex].id,
        }

        const updatedCreatedBlogs = [
          ...createdBlogs,
        ]

        updatedCreatedBlogs[
          localIndex
        ] = updatedBlog

        localStorage.setItem(
          'createdBlogs',
          JSON.stringify(
            updatedCreatedBlogs,
          ),
        )

        toast.success(
          status === 'Published'
            ? 'Blog updated and published!'
            : 'Blog updated as draft!',
        )

        setTimeout(() => {
          navigate('/blogs')
        }, 700)

        return
      }

      // ===================================================
      // UPDATE API BLOG
      // ===================================================

      const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        payload,
      )

      console.log(
        'Update blog response:',
        response.data,
      )

      // ===================================================
      // LOCAL OVERRIDE
      // ===================================================

      const existingOverrides =
        JSON.parse(
          localStorage.getItem(
            'updatedBlogs',
          ) || '[]',
        )

      const newBlog = {
        ...response.data,
        ...payload,
        id: Number(id),
      }

      const filteredOverrides =
        existingOverrides.filter(
          (blog) =>
            String(blog.id) !==
            String(id),
        )

      localStorage.setItem(
        'updatedBlogs',
        JSON.stringify([
          newBlog,
          ...filteredOverrides,
        ]),
      )

      toast.success(
        status === 'Published'
          ? 'Blog updated and published!'
          : 'Blog updated as draft!',
      )

      setTimeout(() => {
        navigate('/blogs')
      }, 700)
    } catch (error) {
      console.error(
        'Update blog error:',
        error,
      )

      toast.error(
        error?.response?.data?.message ||
          'Unable to update blog. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  // =======================================================
  // FORM SUBMIT
  // =======================================================

  const handleSubmit = (e) => {
    e.preventDefault()

    saveBlog(form.status)
  }

  // =======================================================
  // INPUT CLASS
  // =======================================================

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
        : 'border-slate-200'
    }`

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-sm">
          <Loader2
            size={20}
            className="animate-spin text-blue-600"
          />

          <span className="text-sm font-medium text-slate-600">
            Loading blog...
          </span>
        </div>
      </div>
    )
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate('/blogs')
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />

            Back to Blogs
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Content</span>

                <span>/</span>

                <span>All Blogs</span>

                <span>/</span>

                <span className="font-medium text-slate-700">
                  Edit Blog
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Edit Blog
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update your blog content and
                publishing settings.
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Blog ID: {id}
            </div>
          </div>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              BLOG INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Blog Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Basic information about your
                    blog.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 lg:grid-cols-2">

              {/* TITLE */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                  placeholder="Enter blog title"
                  className={inputClass(
                    'title',
                  )}
                />

                <div className="mt-1.5 flex justify-between gap-3">
                  <div>
                    {errors.title && (
                      <p className="text-xs text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
                    {form.title.length}/
                    {MAX_TITLE_LENGTH}
                  </span>
                </div>
              </div>

              {/* SLUG */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                  placeholder="blog-url-slug"
                  className={inputClass(
                    'slug',
                  )}
                />

                <div className="mt-1.5 flex justify-between gap-3">
                  <div>
                    {errors.slug && (
                      <p className="text-xs text-red-600">
                        {errors.slug}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
                    {form.slug.length}/
                    {MAX_SLUG_LENGTH}
                  </span>
                </div>
              </div>

              {/* AUTHOR */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                  placeholder="Author name"
                  className={inputClass(
                    'author',
                  )}
                />

                <div className="mt-1.5 flex justify-between gap-3">
                  <div>
                    {errors.author && (
                      <p className="text-xs text-red-600">
                        {errors.author}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
                    {form.author.length}/
                    {MAX_AUTHOR_LENGTH}
                  </span>
                </div>
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Tag size={15} />

                  Category{' '}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

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
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
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

                {form.status ===
                  'Published' && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Published blogs can only use
                    today or an earlier date.
                  </p>
                )}
              </div>

              {/* PUBLISH DATE */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                  max={
                    form.status ===
                    'Published'
                      ? today
                      : undefined
                  }
                  className={inputClass(
                    'publishDate',
                  )}
                />

                {errors.publishDate && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.publishDate}
                  </p>
                )}

                {form.status ===
                  'Published' && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Maximum date: {today}
                  </p>
                )}
              </div>

              {/* FEATURED IMAGE */}

              <div className="lg:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ImageIcon size={15} />

                  Featured Image URL
                </label>

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
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.featuredImage}
                  </p>
                )}

                {form.featuredImage &&
                  !errors.featuredImage && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={
                          form.featuredImage
                        }
                        alt="Featured preview"
                        className="h-48 w-full object-cover sm:h-64"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            'none'
                        }}
                      />
                    </div>
                  )}
              </div>

              {/* SHORT DESCRIPTION */}

              <div className="lg:col-span-2">
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
                  placeholder="Write a short description..."
                  className={`${inputClass(
                    'shortDescription',
                  )} resize-y`}
                />

                <div className="mt-1.5 flex justify-between gap-3">
                  <div>
                    {errors.shortDescription && (
                      <p className="text-xs text-red-600">
                        {
                          errors.shortDescription
                        }
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
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

              {/* CONTENT */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Blog Content{' '}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={14}
                  maxLength={
                    MAX_CONTENT_LENGTH
                  }
                  placeholder="Write your complete blog content..."
                  className={`${inputClass(
                    'content',
                  )} min-h-[280px] resize-y leading-7`}
                />

                <div className="mt-1.5 flex flex-col justify-between gap-1 text-xs sm:flex-row">
                  <span
                    className={
                      errors.content
                        ? 'text-red-600'
                        : 'text-slate-400'
                    }
                  >
                    {errors.content ||
                      `Minimum ${MIN_CONTENT_LENGTH} characters.`}
                  </span>

                  <span className="text-slate-400">
                    {form.content.length}/
                    {MAX_CONTENT_LENGTH}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <section className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="hidden text-sm text-slate-500 sm:block">
                Make sure all required fields are
                valid before saving.
              </p>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

                {/* SAVE DRAFT */}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    saveBlog('Draft')
                  }
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  Save Draft
                </button>

                {/* UPDATE + PUBLISH */}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    saveBlog('Published')
                  }
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={17} />
                  )}

                  Update & Publish
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}

export default EditBlog