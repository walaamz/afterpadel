
import { useState } from 'react'
import { useNavigate } from 'react-router'
import './NewReflection.css'

const questions = [
  'What went well during your session?',
  'What did you struggle with?',
  'Was there a moment you would approach differently?',
  'What would you like to focus on next time?',
]

type ReflectionAnswer = {
  answer: string
  followUp: string
}

type SessionDetails = {
  sessionType: string
  date: string
  duration: string
  score: string
  sessionFocus: string
}

type SavedReflection = {
  id: string
  createdAt: string
  session: SessionDetails
  answers: ReflectionAnswer[]
  satisfaction?: number
}

function readSession(): SessionDetails | null {
  try {
    const saved = sessionStorage.getItem('afterpadel-session')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function readAnswers(): ReflectionAnswer[] {
  try {
    const saved = sessionStorage.getItem('afterpadel-answers')
    const parsed = saved ? JSON.parse(saved) : []

    return questions.map((_, index) => ({
      answer: parsed[index]?.answer ?? '',
      followUp: parsed[index]?.followUp ?? '',
    }))
  } catch {
    return questions.map(() => ({
      answer: '',
      followUp: '',
    }))
  }
}

export default function ReviewReflection() {
  const navigate = useNavigate()

  const [session] = useState(readSession)
  const [answers, setAnswers] = useState(readAnswers)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [satisfaction, setSatisfaction] = useState<number | null>(null)

  function updateAnswer(
    index: number,
    field: keyof ReflectionAnswer,
    value: string
  ) {
    setAnswers((previous) => {
      const updated = previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )

      sessionStorage.setItem(
        'afterpadel-answers',
        JSON.stringify(updated)
      )

      return updated
    })
  }

  
async function handleApprove() {
  if (isSaving) return

  if (!session) {
    setError('Session details are missing. Please start a new reflection.')
    return
  }

  if (answers.some((item) => !item.answer.trim())) {
    setError('Please complete all four reflection questions before saving.')
    return
  }

  setError('')
  setIsSaving(true)

  const backendReflection = {
    sessionType: session.sessionType,
    date: session.date,
    duration: session.duration ? Number(session.duration) : null,
    score: session.score || null,
    sessionFocus: session.sessionFocus || null,
    wentWell: answers[0].answer,
    wentWellFollowUp: answers[0].followUp,
    struggledWith: answers[1].answer,
    struggledWithFollowUp: answers[1].followUp,
    doDifferently: answers[2].answer,
    doDifferentlyFollowUp: answers[2].followUp,
    nextFocus: answers[3].answer,
    nextFocusFollowUp: answers[3].followUp,
    satisfaction,
  }

  try {
    const existing = localStorage.getItem('afterpadel-journal')
    const parsed = existing ? JSON.parse(existing) : []
    const journal: SavedReflection[] = Array.isArray(parsed) ? parsed : []
    const isFirstReflection = journal.length === 0

    const response = await fetch('http://localhost:8080/api/reflections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendReflection),
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    const saved = await response.json()

    const reflection: SavedReflection = {
      id: String(saved.id),
      createdAt: saved.createdAt,
      session,
      answers,
      ...(satisfaction !== null ? { satisfaction } : {}),
    }

    localStorage.setItem(
      'afterpadel-journal',
      JSON.stringify([reflection, ...journal])
    )

    sessionStorage.removeItem('afterpadel-session')
    sessionStorage.removeItem('afterpadel-answers')
    sessionStorage.removeItem('afterpadel-followups-shown')
    sessionStorage.removeItem('afterpadel-question-index')

    navigate('/reflection/saved', {
      replace: true,
      state: { isFirstReflection },
    })
  } catch (error) {
    console.error('Failed to save reflection:', error)
    setError('Unable to save your reflection. Please try again.')
  } finally {
    setIsSaving(false)
  }
}


  if (!session) {
    return (
      <main className="reflection-page">
        <section className="session-card">
          <h1>Review & Approve</h1>
          <p>No session details were found.</p>
          <button
            className="continue-button"
            onClick={() => navigate('/reflection')}
          >
            Start Reflection
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="reflection-page review-page">
      <div className="reflection-stepper">
        <div className="step completed">
          <span className="step-number">1</span>
          <span>Session Details</span>
        </div>

        <div className="step-line" />

        <div className="step completed">
          <span className="step-number">2</span>
          <span>Guided Reflection</span>
        </div>

        <div className="step-line" />

        <div className="step active">
          <span className="step-number">3</span>
          <span>Review</span>
        </div>
      </div>

      <section className="session-card review-card">
        <h1>Review & Approve</h1>
        <p className="review-intro">
          Take a moment to review your reflection. You can edit your
          answers before saving them to your Journal.
        </p>

        <div className="review-session">
          <h2>Session Summary</h2>
          <p><strong>Type:</strong> {session.sessionType}</p>
          <p><strong>Date:</strong> {session.date}</p>
          {session.duration && (
            <p><strong>Duration:</strong> {session.duration} minutes</p>
          )}
          {session.score && (
            <p><strong>Score:</strong> {session.score}</p>
          )}
          {session.sessionFocus && (
            <p><strong>Focus:</strong> {session.sessionFocus}</p>
          )}
          <button
            type="button"
            className="review-edit-link"
            onClick={() => navigate('/reflection')}
          >
            Edit session details
          </button>
        </div>

        <div className="review-answers">
          {questions.map((question, index) => (
            <div className="review-answer" key={question}>
              <label htmlFor={`answer-${index}`}>
                {index + 1}. {question}
              </label>

              <textarea
                id={`answer-${index}`}
                className="reflection-textarea"
                value={answers[index].answer}
                onChange={(event) =>
                  updateAnswer(index, 'answer', event.target.value)
                }
              />

              {(answers[index].followUp ||
                (() => {
                  try {
                    const saved = sessionStorage.getItem(
                      'afterpadel-followups-shown'
                    )
                    return saved
                      ? JSON.parse(saved)[index] === true
                      : false
                  } catch {
                    return false
                  }
                })()) && (
                <div className="review-followup">
                  <label htmlFor={`followup-${index}`}>
                    AI Follow-up Response
                  </label>
                  <textarea
                    id={`followup-${index}`}
                    className="reflection-textarea followup-textarea"
                    value={answers[index].followUp}
                    onChange={(event) =>
                      updateAnswer(index, 'followUp', event.target.value)
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

          
<div className="review-satisfaction">
  <h2>Session Satisfaction</h2>
  <p>
    How satisfied did you feel with your overall session?
    <span> (Optional)</span>
  </p>

  <div
    className="satisfaction-options"
    role="group"
    aria-label="Rate your session satisfaction"
  >
    {[1, 2, 3, 4, 5].map((rating) => (
      <button
        key={rating}
        type="button"
        className={
          rating <= (satisfaction ?? 0)
            ? "satisfaction-dot selected"
            : "satisfaction-dot"
        }
        aria-label={`${rating} out of 5`}
        aria-pressed={satisfaction === rating}
        onClick={() =>
          setSatisfaction((current) =>
            current === rating ? null : rating
          )
        }
      />
    ))}
  </div>

  <span className="satisfaction-label">
    {satisfaction === null
      ? "Not rated"
      : `${satisfaction}/5 · ${
          ["", "Very dissatisfied", "Dissatisfied", "Neutral",
           "Satisfied", "Very satisfied"][satisfaction]
        }`}
  </span>
</div>

        {error && <p className="review-error" role="alert">{error}</p>}

        <div className="session-actions">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/reflection/guided')}
          >
            Back
          </button>

          <button
            type="button"
            className="continue-button"
            onClick={handleApprove}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Approve & Save →'}
        </button>
        </div>
      </section>
    </main>
  )
}
