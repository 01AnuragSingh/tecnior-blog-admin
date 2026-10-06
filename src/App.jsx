import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Blogs from './pages/Blogs'
import CreateBlog from './pages/CreateBlog'
import BlogDetails from './pages/BlogDetails'
import EditBlog from './pages/EditBlog'

import ProtectedRoute from './routes/ProtectedRoute'
import AdminLayout from './components/Layout/AdminLayout'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>

            {/* Public */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Protected Admin Area */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>

                {/* Dashboard */}
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                {/* All Blogs */}
                <Route
                  path="/blogs"
                  element={<Blogs />}
                />

                {/* Create Blog */}
                <Route
                  path="/blogs/create"
                  element={<CreateBlog />}
                />

                {/* Edit Blog */}
                <Route
                  path="/blogs/:id/edit"
                  element={<EditBlog />}
                />

                {/* Blog Details */}
                <Route
                  path="/blogs/:id"
                  element={<BlogDetails />}
                />

              </Route>
            </Route>

            {/* Home Redirect */}
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            {/* Unknown Route */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App