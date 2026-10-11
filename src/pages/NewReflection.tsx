
import { useState } from 'react'
import { useNavigate } from 'react-router'
import './NewReflection.css'

type SessionType =
  | 'Friendly/Recreational Match'
  | 'Competitive/Ranked Match'
  | 'Tournament Match'
  | 'Training/Practice Session'

const sessionTypes: SessionType[] = [
  'Friendly/Recreational Match',
  'Competitive/Ranked Match',
  'Tournament Match',
  'Training/Practice Session',
]

export default function NewReflection() {
  const navigate = useNavigate()


const [savedSession] = useState(() => {
  try {
    const saved = sessionStorage.getItem('afterpadel-session')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
})

const [sessionType, setSessionType] = useState<SessionType | ''>(
  savedSession?.sessionType ?? ''
)
const [date, setDate] = useState(savedSession?.date ?? '')
const [duration, setDuration] = useState(savedSession?.duration ?? '')
const [score, setScore] = useState(savedSession?.score ?? '')
const [sessionFocus, setSessionFocus] = useState(
  savedSession?.sessionFocus ?? ''
)


  const isTraining = sessionType === 'Training/Practice Session'
  const isMatch = sessionType !== '' && !isTraining
  const canContinue = sessionType !== '' && date !== ''

  function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canContinue) return

    const sessionDetails = {
      sessionType,
      date,
      duration,
      score: isMatch ? score : '',
      sessionFocus,
    }

    sessionStorage.setItem(
      'afterpadel-session',
      JSON.stringify(sessionDetails)
    )

    navigate('/reflection/guided')
  }

  return (
    <main className="reflection-page">
      <div className="reflection-stepper">
        <div className="step active">
          <span className="step-number">1</span>
          <span>Session Details</span>
        </div>

        <div className="step-line" />

        <div className="step">
          <span className="step-number">2</span>
          <span>Guided Reflection</span>
        </div>

        <div className="step-line" />

        <div className="step">
          <span className="step-number">3</span>
          <span>Review</span>
        </div>
      </div>

      <form className="session-card" onSubmit={handleContinue}>
        <h1>Session Details</h1>
        <p className="session-subtitle">
          What type of session did you play?
        </p>

        <div className="session-options">
          {sessionTypes.map((type) => (
            <label className="session-option" key={type}>
              <input
                type="radio"
                name="sessionType"
                value={type}
                checked={sessionType === type}
                onChange={() => {
                  setSessionType(type)
                  setScore('')
                }}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>

        <div className="session-fields">
          <div className="field">
            <label htmlFor="session-date">Date</label>
            <input
              id="session-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="session-duration">
              Duration (minutes)
            </label>
            <input
              id="session-duration"
              type="number"
              min="1"
              placeholder="e.g. 90"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>
        </div>

        {isMatch && (
          <div className="field optional-field">
            <label htmlFor="session-score">
              Match Score (optional)
            </label>
            <input
              id="session-score"
              type="text"
              placeholder="e.g. 6-4, 3-6, 6-2"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>
        )}

        {sessionType !== '' && (
          <div className="field optional-field">
            <label htmlFor="session-focus">
              {isTraining
                ? 'What were you working on? (optional)'
                : 'Session Focus (optional)'}
            </label>
            <input
              id="session-focus"
              type="text"
              placeholder="e.g. Net positioning, glass defense..."
              value={sessionFocus}
              onChange={(event) => setSessionFocus(event.target.value)}
            />
          </div>
        )}

        <div className="session-actions">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/')}
          >
            Back
          </button>

          <button
            type="submit"
            className="continue-button"
            disabled={!canContinue}
          >
            Continue →
          </button>
        </div>
      </form>
    </main>
  )
}
