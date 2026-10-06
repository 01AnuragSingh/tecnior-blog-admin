import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
  username: '',
  password: '',
})

  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }))

    setLoginError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
  newErrors.username = 'Username is required.'
}

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    return newErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setLoginError('')

    const result = await login(
  formData.username,
  formData.password,
)

    setIsSubmitting(false)

    if (!result.success) {
      setLoginError(result.message)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Section */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <ShieldCheck size={24} />
              </div>

              <div>
                <p className="text-lg font-bold">TechNior</p>
                <p className="text-xs text-blue-100">
                  Blog Administration
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200">
              Admin Portal
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              Manage your content with confidence.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Create, manage and publish blog content from one powerful
              administration panel.
            </p>
          </div>

          <p className="relative z-10 text-sm text-blue-200">
            © 2026 TechNior. Admin Panel.
          </p>
        </section>

        {/* Login Section */}
        <section className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ShieldCheck size={24} />
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-900">
                    TechNior
                  </p>

                  <p className="text-xs text-slate-500">
                    Blog Administration
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access your admin dashboard.
                </p>
              </div>

              {loginError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Username / Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                        errors.username
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  {errors.username && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`w-full rounded-lg border bg-white py-3 pl-10 pr-11 text-sm outline-none transition focus:ring-2 ${
                        errors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-700">
                  Demo credentials
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Username: emilys
                </p>

                <p className="text-xs text-slate-500">
                  Password: emilyspass
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure administrator access
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login