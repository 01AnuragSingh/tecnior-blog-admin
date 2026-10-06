# TechNior Blog Management Admin Panel

A responsive Blog Management Admin Panel built with React.js and Vite for the Tecnior Technology Frontend Developer Assessment.

The application provides authentication, dashboard analytics, blog CRUD operations, search, filtering, pagination, responsive layouts, dark mode, form validation, notifications, loading states, and confirmation dialogs.

## Live Demo

Coming soon — deployed on Vercel.

## GitHub Repository

https://github.com/01AnuragSingh/tecnior-blog-admin

---

## Features

### Authentication
- Login using DummyJSON authentication API
- Protected application routes
- Persistent authentication session
- Logout functionality

### Dashboard
- Total blogs overview
- Published blogs count
- Draft blogs count
- Total views
- Recent blog posts
- Content overview
- Quick actions
- Loading skeletons
- Error handling

### Blog Management
- View all blogs
- Create new blogs
- Edit existing blogs
- View blog details
- Delete blogs
- Save blogs as Draft
- Publish blogs
- Search blogs
- Filter by status
- Filter by category
- Pagination
- Delete confirmation modal
- Toast notifications

### Blog Form
- Title validation
- Slug validation
- Author validation
- Category selection
- Short description
- Content editor
- Character limits
- Meaningful text validation
- Draft and Published status

### UI / UX
- Fully responsive design
- Desktop, tablet and mobile layouts
- Dark mode
- Responsive sidebar
- Mobile navigation drawer
- Loading skeletons
- Empty states
- Error states
- Toast notifications
- Clean admin dashboard interface

---

## Tech Stack

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React
- React Hot Toast
- DummyJSON REST API
- Browser LocalStorage

---

## API

This project uses the DummyJSON REST API as a mock backend.

API Base URL:

https://dummyjson.com

### Authentication

```text
POST /auth/login
GET  /auth/me
