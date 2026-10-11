import { Routes, Route, NavLink, useNavigate } from 'react-router'
import NewReflection from './pages/NewReflection'
import GuidedReflection from './pages/GuidedReflection'
import ReviewReflection from './pages/ReviewReflection'

import './App.css'

function App() {
  const navigate = useNavigate()
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
  <Route path="/journal" element={<main className="dashboard"><h1>Journal</h1></main>} />
  <Route path="/progress" element={<main className="dashboard"><h1>Progress</h1></main>} />
  <Route path="/coach" element={<main className="dashboard"><h1>Coach</h1></main>} />
  <Route path="/profile" element={<main className="dashboard"><h1>Profile</h1></main>} />
</Routes>
    </div>
  )
}

export default App
