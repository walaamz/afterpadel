
import { Link, useLocation } from 'react-router'
import './ReflectionSaved.css'

type SavedLocationState = {
  isFirstReflection?: boolean
}

export default function ReflectionSaved() {
  const location = useLocation()
  const state = location.state as SavedLocationState | null
  const isFirstReflection = state?.isFirstReflection === true

  return (
    <main className="reflection-saved-page">
      <section className="reflection-saved-card">
        <div className="saved-checkmark" aria-hidden="true">
          ✓
        </div>

        <h1>
          {isFirstReflection
            ? 'Your First Reflection Is Saved!'
            : 'Your Reflection Is Saved!'}
        </h1>

        <p className="saved-subtitle">
          {isFirstReflection
            ? "You've taken the first step toward understanding your game."
            : "You've taken another step toward understanding your game."}
        </p>

        <div className="saved-information">
          <h2>What's next?</h2>

          <p>
            Your reflection is saved in your Journal,
            ready whenever you want to revisit it.
          </p>

          <p>
            As you log more sessions, AfterPadel can help
            you recognize recurring patterns.
          </p>
        </div>

        <Link to="/journal" className="saved-journal-button">
          View My Journal →
        </Link>

        <Link to="/" className="saved-dashboard-link">
          Return to Dashboard
        </Link>
      </section>
    </main>
  )
}
