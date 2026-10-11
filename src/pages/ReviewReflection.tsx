
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

  function handleApprove() {
    if (!session) {
      setError('Session details are missing. Please start a new reflection.')
      return
    }

    if (answers.some((item) => !item.answer.trim())) {
      setError('Please complete all four reflection questions before saving.')
      return
    }

    const reflection: SavedReflection = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      session,
      answers,
    }

    try {
      const existing = localStorage.getItem('afterpadel-journal')
      const parsed = existing ? JSON.parse(existing) : []
      const journal: SavedReflection[] = Array.isArray(parsed) ? parsed : []

      localStorage.setItem(
        'afterpadel-journal',
        JSON.stringify([reflection, ...journal])
      )

      sessionStorage.removeItem('afterpadel-session')
      sessionStorage.removeItem('afterpadel-answers')
      sessionStorage.removeItem('afterpadel-followups-shown')
      sessionStorage.removeItem('afterpadel-question-index')

      navigate('/journal')
    } catch {
      setError('Unable to save your reflection. Please try again.')
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
          >
            Approve & Save →
          </button>
        </div>
      </section>
    </main>
  )
}
