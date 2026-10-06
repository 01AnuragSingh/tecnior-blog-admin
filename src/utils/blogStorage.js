const CREATED_KEY = 'createdBlogs'
const UPDATED_KEY = 'updatedBlogs'
const DELETED_KEY = 'deletedBlogIds'

// ============================================================
// SAFE JSON HELPERS
// ============================================================

const readJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)

    if (!value) {
      return fallback
    }

    return JSON.parse(value)
  } catch (error) {
    console.error(`Failed to read ${key}`, error)
    return fallback
  }
}

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

// ============================================================
// CREATED BLOGS
// ============================================================

export const getCreatedBlogs = () => {
  return readJSON(CREATED_KEY, [])
}

export const saveCreatedBlogs = (blogs) => {
  writeJSON(CREATED_KEY, blogs)
}

export const addCreatedBlog = (blog) => {
  const blogs = getCreatedBlogs()

  const updated = [
    ...blogs,
    blog,
  ]

  saveCreatedBlogs(updated)

  return updated
}

// ============================================================
// UPDATED BLOGS
// ============================================================

export const getUpdatedBlogs = () => {
  return readJSON(UPDATED_KEY, [])
}

export const saveUpdatedBlogs = (blogs) => {
  writeJSON(UPDATED_KEY, blogs)
}

export const saveUpdatedBlog = (blog) => {
  const blogs = getUpdatedBlogs()

  const existingIndex = blogs.findIndex(
    (item) => String(item.id) === String(blog.id),
  )

  let updated

  if (existingIndex !== -1) {
    updated = [...blogs]

    updated[existingIndex] = {
      ...updated[existingIndex],
      ...blog,
    }
  } else {
    updated = [
      ...blogs,
      blog,
    ]
  }

  saveUpdatedBlogs(updated)

  return updated
}

// ============================================================
// DELETED BLOGS
// ============================================================

export const getDeletedBlogIds = () => {
  return readJSON(DELETED_KEY, [])
}

export const saveDeletedBlogIds = (ids) => {
  writeJSON(DELETED_KEY, ids)
}

export const addDeletedBlogId = (id) => {
  const deletedIds = getDeletedBlogIds()

  const normalizedId = String(id)

  if (!deletedIds.includes(normalizedId)) {
    deletedIds.push(normalizedId)
  }

  saveDeletedBlogIds(deletedIds)

  return deletedIds
}

// ============================================================
// REMOVE BLOG FROM CREATED / UPDATED STORAGE
// ============================================================

export const removeBlogFromLocalStorage = (id) => {
  const normalizedId = String(id)

  const createdBlogs = getCreatedBlogs()

  const filteredCreated = createdBlogs.filter(
    (blog) =>
      String(blog.id) !== normalizedId,
  )

  saveCreatedBlogs(filteredCreated)

  const updatedBlogs = getUpdatedBlogs()

  const filteredUpdated = updatedBlogs.filter(
    (blog) =>
      String(blog.id) !== normalizedId,
  )

  saveUpdatedBlogs(filteredUpdated)
}

// ============================================================
// GET LOCAL BLOG
// ============================================================

export const getLocalBlog = (id) => {
  const normalizedId = String(id)

  const createdBlogs = getCreatedBlogs()

  const createdBlog = createdBlogs.find(
    (blog) =>
      String(blog.id) === normalizedId,
  )

  const updatedBlogs = getUpdatedBlogs()

  const updatedBlog = updatedBlogs.find(
    (blog) =>
      String(blog.id) === normalizedId,
  )

  if (!createdBlog && !updatedBlog) {
    return null
  }

  return {
    ...(createdBlog || {}),
    ...(updatedBlog || {}),
  }
}

// ============================================================
// MERGE API + LOCAL DATA
// ============================================================

export const mergeBlogs = (apiBlogs = []) => {
  const createdBlogs = getCreatedBlogs()
  const updatedBlogs = getUpdatedBlogs()
  const deletedBlogIds = getDeletedBlogIds()

  const deletedSet = new Set(
    deletedBlogIds.map(String),
  )

  // ----------------------------------------------------------
  // API BLOGS
  // ----------------------------------------------------------

  let mergedBlogs = apiBlogs
    .filter(
      (blog) =>
        !deletedSet.has(String(blog.id)),
    )
    .map((blog) => {
      const update = updatedBlogs.find(
        (item) =>
          String(item.id) === String(blog.id),
      )

      if (update) {
        return {
          ...blog,
          ...update,
        }
      }

      return blog
    })

  // ----------------------------------------------------------
  // CREATED BLOGS
  // ----------------------------------------------------------

  const apiIds = new Set(
    mergedBlogs.map((blog) =>
      String(blog.id),
    ),
  )

  const localCreatedBlogs =
    createdBlogs.filter(
      (blog) =>
        !deletedSet.has(String(blog.id)) &&
        !apiIds.has(String(blog.id)),
    )

  mergedBlogs = [
    ...localCreatedBlogs,
    ...mergedBlogs,
  ]

  return mergedBlogs
}