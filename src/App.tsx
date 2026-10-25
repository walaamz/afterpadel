import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router'
import NewReflection from './pages/NewReflection'
import GuidedReflection from './pages/GuidedReflection'
import ReviewReflection from './pages/ReviewReflection'
import Journal from "./pages/Journal";
import ReflectionSaved from './pages/ReflectionSaved'
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import { useEffect, useState } from 'react'
import afterpadelLogo from './assets/afterpadel-logo.png'
import afterpadelWordmark from './assets/afterpadel.png'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import CoachReview from "./pages/CoachReview";
import Coach from "./pages/Coach";
import CompareReflections from "./pages/CompareReflections";

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isPublicPage =
  location.pathname === '/login' ||
  location.pathname === '/register' ||
  location.pathname.startsWith('/coach/review/')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  type AppNotification = {
  id: number
  title: string
  message: string
  link: string
  read: boolean
  createdAt: string
}

const [notifications, setNotifications] = useState<AppNotification[]>([])

const unreadCount = notifications.filter(
  (notification) => !notification.read
).length
  const [loggedInName, setLoggedInName] = useState<string | null>(null)
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null)

  useEffect(() => {
  async function loadNotifications() {
    if (isPublicPage) {
      setNotifications([])
      return
    }

    try {
      const response = await fetch(
        'http://localhost:8080/api/notifications',
        { credentials: 'include' }
      )

      if (!response.ok) {
        setNotifications([])
        return
      }

      const data: AppNotification[] = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Unable to load notifications:', error)
    }
  }

  loadNotifications()
}, [location.pathname, isPublicPage])

useEffect(() => {
  async function loadCurrentUser() {
    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
  setLoggedInName(null)
  setLoggedInUserId(null)
  return
}

const user = await response.json()
setLoggedInName(user.fullName)
setLoggedInUserId(user.id)
    } catch {
      setLoggedInName(null)
      setLoggedInUserId(null)
    }
  }

  loadCurrentUser()
}, [location.pathname])
  type RecentReflection = {
  id: number
  sessionType: string
  date: string
  createdAt: string
  wentWell: string | null
  struggledWith: string | null
}

const [recentReflections, setRecentReflections] = useState<RecentReflection[]>([])
const [latestInsights, setLatestInsights] = useState({
  strength: '',
  challenge: '',
})
const [totalReflections, setTotalReflections] = useState(0)
  const [draftModalOpen, setDraftModalOpen] = useState(false)

function hasUnfinishedReflection() {
  // Check whether session details have been saved
  const savedSession = sessionStorage.getItem('afterpadel-session')

  if (savedSession) {
    try {
      const session = JSON.parse(savedSession)

      if (session?.sessionType && session?.date) {
        return true
      }
    } catch {
      // Ignore invalid saved data
    }
  }

  // Check whether guided reflection answers have been saved
  const savedAnswers = sessionStorage.getItem('afterpadel-answers')

  if (savedAnswers) {
    try {
      const answers = JSON.parse(savedAnswers)

      if (
        Array.isArray(answers) &&
        answers.some(
          (item) =>
            typeof item?.answer === 'string' &&
            item.answer.trim() !== ''
        )
      ) {
        return true
      }
    } catch {
      // Ignore invalid saved data
    }
  }

  return false
}

async function handleSignOut() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    setLoggedInName(null)
setLoggedInUserId(null)
navigate('/login')
  } catch (error) {
    console.error('Error signing out:', error)
    alert('Unable to sign out. Please try again.')
  }
}

function handleStartReflection() {
  if (hasUnfinishedReflection()) {
    setDraftModalOpen(true)
  } else {
    navigate('/reflection')
  }
}

function handleContinueDraft() {
  setDraftModalOpen(false)

  const savedStep = sessionStorage.getItem('afterpadel-draft-step')

  navigate(
    savedStep === 'review'
      ? '/reflection/review'
      : '/reflection/guided'
  )
}

function handleNewDraft() {
  sessionStorage.removeItem('afterpadel-session')
  sessionStorage.removeItem('afterpadel-question-index')
  sessionStorage.removeItem('afterpadel-answers')
  sessionStorage.removeItem('afterpadel-followups-shown')
  sessionStorage.removeItem('afterpadel-draft-step')
  sessionStorage.removeItem('afterpadel-satisfaction')

  setDraftModalOpen(false)
  navigate('/reflection')
}

  const [username, setUsername] = useState(() => {
  try {
    const saved = localStorage.getItem("afterpadel-profile");
    return saved ? JSON.parse(saved).username || "User123" : "User123";
  } catch {
    return "User123";
  }
});

useEffect(() => {
  function updateUsername() {
    try {
      const saved = localStorage.getItem("afterpadel-profile");
      setUsername(saved ? JSON.parse(saved).username || "User123" : "User123");
    } catch {
      setUsername("User123");
    }
  }

  window.addEventListener("afterpadel-profile-updated", updateUsername);

  return () => {
    window.removeEventListener("afterpadel-profile-updated", updateUsername);
  };
}, []);

useEffect(() => {
  async function loadRecentReflections() {
    try {
      const response = await fetch('http://localhost:8080/api/reflections', {
  credentials: 'include',
})

      if (!response.ok) {
        throw new Error('Failed to load reflections')
      }

      const data: RecentReflection[] = await response.json()
      setTotalReflections(data.length)
      const newestFirst = [...data].sort(
  (a, b) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
)

setLatestInsights({
  strength:
    newestFirst.find((entry) => entry.wentWell?.trim())
      ?.wentWell?.trim() || '',
  challenge:
    newestFirst.find((entry) => entry.struggledWith?.trim())
      ?.struggledWith?.trim() || '',
})

      const recent = [...data]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 3)

      setRecentReflections(recent)
    } catch (error) {
      console.error('Error loading recent reflections:', error)
    }
  }

    loadRecentReflections()
}, [location.pathname])

async function handleNotificationClick(notification: AppNotification) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/notifications/${notification.id}/read`,
      {
        method: 'PATCH',
        credentials: 'include'
      }
    )

    if (response.ok) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read: true }
            : item
        )
      )
    }
  } catch (error) {
    console.error('Unable to mark notification as read:', error)
  }

  setNotificationsOpen(false)
  navigate(notification.link)
}

  return (
    <div className="app">
      {!isPublicPage && (
      <>
      <header className="site-header">
        <div className="header-content">
          <div className="brand">
  <img
    src={afterpadelLogo}
    alt=""
    className="brand-logo"
  />
  <img
    src={afterpadelWordmark}
    alt="AfterPadel"
    className="brand-wordmark"
  />
</div>

          <div className="account">
<span>{loggedInName ?? username}</span>


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

    {unreadCount > 0 && (
      <span className="notification-badge">{unreadCount}</span>
    )}
  </button>

  {notificationsOpen && (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        <span>{unreadCount} new</span>
      </div>

      {notifications.length === 0 ? (
        <div className="notification-item">
          <div className="notification-item-icon">✓</div>
          <div>
            <strong>All caught up!</strong>
            <p>You don't have any notifications yet.</p>
          </div>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${
              notification.read ? '' : 'unread'
            }`}
            onClick={() => handleNotificationClick(notification)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleNotificationClick(notification)
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="notification-item-icon">✓</div>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small>
                {new Date(notification.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
        ))
      )}

      <div className="notification-footer">
        <span>
          {unreadCount === 0
            ? "You're all caught up!"
            : `${unreadCount} unread notification${
                unreadCount === 1 ? '' : 's'
              }`}
        </span>
      </div>
    </div>
  )}
</div>


  <button type="button" onClick={handleSignOut}>
  Sign Out
</button>
</div>
  </div>
      </header>

      <nav className="navigation">
        <div className="nav-content">
          
          <NavLink to="/">Dashboard</NavLink>
          <button
  type="button"
  className="nav-reflection-button"
  onClick={handleStartReflection}
>
  New Reflection
</button>
          <NavLink to="/journal">Journal</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/coach">Coach</NavLink>
          <NavLink to="/profile">Profile</NavLink>

        </div>
            </nav>
      </>
    )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/coach/review/:token" element={<CoachReview />} />
        <Route element={<ProtectedRoute />}>

  <Route
    path="/"
    element={
      <main className="dashboard" id="dashboard">
        <section className="welcome">
          <h1>Welcome Back, {loggedInName ?? username}!</h1>
          <p>Every match is an opportunity to learn something new.</p>
          <button
  className="primary-button"
  onClick={handleStartReflection}
>
  Reflect on a Match →
</button>
        </section>

        <section className="dashboard-cards">
          <article className="dashboard-card">
            <h2>Recent Reflections</h2>
            <div className="card-divider" />

            {recentReflections.length > 0 ? (
  recentReflections.map((reflection) => (
    <div className="reflection-entry" key={reflection.id}>
      <span>{reflection.sessionType}</span>
      <span>
        {reflection.date
          ? new Date(`${reflection.date}T12:00:00`).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric' }
            )
          : '—'}
      </span>
    </div>
  ))
) : (
  <p className="card-description">
    No reflections saved yet.
  </p>
)}

            <NavLink className="card-link" to="/journal">
  View All →
</NavLink>
          </article>

          <article className="dashboard-card">
  <h2>Recent Insights</h2>
  <div className="card-divider" />

  {latestInsights.strength || latestInsights.challenge ? (
    <>
      {latestInsights.strength && (
        <p className="progress-item">
          Recent Strength
          <span>{latestInsights.strength}</span>
        </p>
      )}

      {latestInsights.challenge && (
        <p className="progress-item">
          Recent Challenge
          <span>{latestInsights.challenge}</span>
        </p>
      )}

      <NavLink className="card-link" to="/progress">
        View Insights →
      </NavLink>
    </>
  ) : (
    <p className="card-description">
      Your insights will appear here after you save a reflection.
    </p>
  )}
</article>
          <article className="dashboard-card">
  <h2>Your Progress</h2>
  <div className="card-divider" />

  <p className="progress-item">
    Sessions Logged
    <span>{totalReflections} sessions</span>
  </p>

  <p className="progress-item">
    Reflections Completed
    <span>{totalReflections} reflections</span>
  </p>

  <NavLink className="card-link" to="/progress">
    View Progress →
  </NavLink>
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
  <Route path="/coach" element={<Coach />} />
  <Route
  path="/coach/compare/:reflectionId/:requestId"
  element={<CompareReflections />}
/>
  <Route
  path="/profile"
  element={<Profile userId={loggedInUserId} />}
/>
  <Route path="/reflection/saved" element={<ReflectionSaved />} />
</Route>
</Routes>
    {draftModalOpen && (
  <div
    className="draft-modal-overlay"
    onClick={() => setDraftModalOpen(false)}
  >
    <div
      className="draft-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-modal-title"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="draft-modal-close"
        aria-label="Close"
        onClick={() => setDraftModalOpen(false)}
      >
        ×
      </button>

      <h2 id="draft-modal-title">
        You have an unfinished reflection
      </h2>

      <p>
        Would you like to continue where you left off
        or start a new reflection?
      </p>

      <div className="draft-modal-actions">
        <button
          type="button"
          className="draft-continue-button"
          onClick={handleContinueDraft}
        >
          Continue Previous Reflection
        </button>

        <button
          type="button"
          className="draft-new-button"
          onClick={handleNewDraft}
        >
          Start New Reflection
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

export default App
