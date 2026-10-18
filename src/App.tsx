import { Routes, Route, NavLink, useNavigate } from 'react-router'
import NewReflection from './pages/NewReflection'
import GuidedReflection from './pages/GuidedReflection'
import ReviewReflection from './pages/ReviewReflection'
import Journal from "./pages/Journal";
import ReflectionSaved from './pages/ReflectionSaved'
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import { useState } from 'react'


import './App.css'

function App() {
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  return (
    <div className="app">
      <header className="site-header">
        <div className="header-content">
          <div className="brand">
            <span className="brand-icon">AP</span>
            <span className="brand-name">AfterPadel</span>
          </div>

          <div className="account">
  <span>User123</span>

  <div className="notification-container">
    <button
      type="button"
      className="notification-bell"
      aria-label="Notifications"
      aria-expanded={notificationsOpen}
      onClick={() => setNotificationsOpen(!notificationsOpen)}
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>

      <span className="notification-badge">3</span>
    </button>

    {notificationsOpen && (
      <div className="notification-dropdown">
        <div className="notification-header">
          <h3>Notifications</h3>
          <span>3 new</span>
        </div>

        <div className="notification-item unread">
          <div className="notification-item-icon">✓</div>
          <div>
            <strong>Reflection saved</strong>
            <p>Your latest reflection has been added to your Journal.</p>
            <small>Just now</small>
          </div>
        </div>

        <div className="notification-item unread">
          <div className="notification-item-icon">★</div>
          <div>
            <strong>New milestone!</strong>
            <p>You've completed 5 reflections. Keep up the consistency!</p>
            <small>2 hours ago</small>
          </div>
        </div>

        <div className="notification-item unread">
          <div className="notification-item-icon">◎</div>
          <div>
            <strong>Next session focus</strong>
            <p>Remember to practice your back glass defense.</p>
            <small>Yesterday</small>
          </div>
        </div>

        <div className="notification-footer">
          <span>You're all caught up after reading these.</span>
        </div>
      </div>
    )}
  </div>

  <button type="button">Sign Out</button>
</div>
  </div>
      </header>

      <nav className="navigation">
        <div className="nav-content">
          
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/reflection">New Reflection</NavLink>
          <NavLink to="/journal">Journal</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/coach">Coach</NavLink>
          <NavLink to="/profile">Profile</NavLink>

        </div>
      </nav>

      <Routes>
  <Route
    path="/"
    element={
      <main className="dashboard" id="dashboard">
        <section className="welcome">
          <h1>Welcome Back, User123!</h1>
          <p>Every match is an opportunity to learn something new.</p>
          <button
          className="primary-button"
          onClick={() => navigate('/reflection')}
          >
        Reflect on a Match →
        </button>
        </section>

        <section className="dashboard-cards">
          <article className="dashboard-card">
            <h2>Recent Reflections</h2>
            <div className="card-divider" />

            <div className="reflection-entry">
              <span>Training</span>
              <span>Oct 8</span>
            </div>

            <div className="reflection-entry">
              <span>Match</span>
              <span>Oct 10</span>
            </div>

            <div className="reflection-entry">
              <span>Tournament</span>
              <span>Nov 11</span>
            </div>

            <a className="card-link" href="#journal">
              View All →
            </a>
          </article>

          <article className="dashboard-card">
            <h2>Recent Insights</h2>
            <div className="card-divider" />
            <p className="card-description">
              Insights from your reflections will appear here.
            </p>
          </article>

          <article className="dashboard-card">
            <h2>Your Progress</h2>
            <div className="card-divider" />

            <p className="progress-item">
              Glass Defense
              <span>Improving confidence</span>
            </p>

            <p className="progress-item">
              Net Positioning
              <span>Better awareness reported</span>
            </p>

            <p className="progress-note">
              Example insights based on reflections
            </p>
          </article>
        </section>
      </main>
    }
  />
  <Route path="/reflection" element={<NewReflection />} />
  <Route
  path="/reflection/guided"
  element={<GuidedReflection />}
/>
  <Route
  path="/reflection/review"
  element={<ReviewReflection />}
/>
  <Route path="/journal" element={<Journal />} />
  <Route path="/progress" element={<Progress />} />
  <Route path="/coach" element={<main className="dashboard"><h1>Coach</h1></main>} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/reflection/saved" element={<ReflectionSaved />} />
</Routes>
    </div>
  )
}

export default App
