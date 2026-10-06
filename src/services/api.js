import axios from 'axios'

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tecnior_access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', {
      username,
      password,
      expiresInMins: 60,
    }),

  getCurrentUser: () => api.get('/auth/me'),
}

export const blogApi = {
  getBlogs: (params = {}) =>
    api.get('/posts', {
      params,
    }),

  getBlog: (id) =>
    api.get(`/posts/${id}`),

  createBlog: (data) =>
    api.post('/posts/add', data),

  updateBlog: (id, data) =>
    api.put(`/posts/${id}`, data),

  deleteBlog: (id) =>
    api.delete(`/posts/${id}`),
}

export default api