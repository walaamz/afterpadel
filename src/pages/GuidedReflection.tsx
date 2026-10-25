
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import './NewReflection.css'

const questions = [
  {
    title: 'What went well during your session?',
    hint: 'Think about the shots, decisions, or moments you felt good about.',
  },
  {
    title: 'What did you struggle with?',
    hint: 'Think about any technical, tactical, or mental challenges.',
  },
  {
    title: 'Was there a moment you would approach differently?',
    hint: 'Consider a decision or situation you would handle differently.',
  },
  {
    title: 'What would you like to focus on next time?',
    hint: 'Think about one area you want to improve.',
  },
]

type ReflectionAnswer = {
  answer: string
  followUp: string
  followUpQuestion?: string
}

const emptyAnswers: ReflectionAnswer[] = questions.map(() => ({
  answer: '',
  followUp: '',
  followUpQuestion: '',
}))

export default function GuidedReflection() {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)

  const [questionIndex, setQuestionIndex] = useState(() => {
  const saved = sessionStorage.getItem('afterpadel-question-index')

  if (saved === null) return 0

  const index = Number(saved)

  return Number.isInteger(index) && index >= 0 && index < questions.length
    ? index
    : 0
})

useEffect(() => {
  sessionStorage.setItem('afterpadel-draft-step', 'guided')
}, [])

    useEffect(() => {
  sessionStorage.setItem(
    'afterpadel-question-index',
    String(questionIndex)
  )
}, [questionIndex])

  const [answers, setAnswers] = useState<ReflectionAnswer[]>(() => {
    try {
      const saved = sessionStorage.getItem('afterpadel-answers')
      return saved ? JSON.parse(saved) : emptyAnswers
    } catch {
      return emptyAnswers
    }
  })

  const [followUpsShown, setFollowUpsShown] = useState<boolean[]>(() => {
  try {
    const saved = sessionStorage.getItem('afterpadel-followups-shown')
    const parsed = saved ? JSON.parse(saved) : []
    return questions.map((_, index) => parsed[index] === true)
  } catch {
    return questions.map(() => false)
  }
})

const showFollowUp = followUpsShown[questionIndex]

function revealFollowUp() {
  setFollowUpsShown((previous) => {
    const updated = [...previous]
    updated[questionIndex] = true

    sessionStorage.setItem(
      'afterpadel-followups-shown',
      JSON.stringify(updated)
    )

    return updated
  })
}

async function generateFollowUp() {
  if (isGenerating) return

  setIsGenerating(true)

  try {
    const response = await fetch('http://localhost:8080/api/followup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: current.answer,
        question: questions[questionIndex].title,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate follow-up')
    }

    const data: { question: string } = await response.json()

    setAnswers((previous) => {
      const updated = previous.map((item, index) =>
        index === questionIndex
          ? { ...item, followUpQuestion: data.question }
          : item
      )

      sessionStorage.setItem(
        'afterpadel-answers',
        JSON.stringify(updated)
      )

      return updated
    })

    revealFollowUp()
  } catch (error) {
    console.error('Follow-up generation failed:', error)
    alert('Unable to generate a follow-up question. Please try again.')
  } finally {
    setIsGenerating(false)
  }
}

  const current = answers[questionIndex]

  function updateAnswer(field: keyof ReflectionAnswer, value: string) {
    setAnswers((previous) => {
      const updated = previous.map((item, index) =>
        index === questionIndex
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

    async function handleContinue() {
  if (!current.answer.trim() || isGenerating) return

  if (!showFollowUp) {
    if (current.followUpQuestion) {
      revealFollowUp()
    } else {
      await generateFollowUp()
    }
    return
  }

  if (questionIndex < questions.length - 1) {
    setQuestionIndex((previous) => previous + 1)
  } else {
    navigate('/reflection/review')
  }
}

    function handleBack() {
     if (questionIndex > 0) {
        setQuestionIndex((previous) => previous - 1)
     } else {
        navigate('/reflection')
        }
    }

  return (
    <main className="reflection-page guided-page">
      <div className="reflection-stepper">
        <div className="step completed">
          <span className="step-number">1</span>
          <span>Session Details</span>
        </div>

        <div className="step-line" />

        <div className="step active">
          <span className="step-number">2</span>
          <span>Guided Reflection</span>
        </div>

        <div className="step-line" />

        <div className="step">
          <span className="step-number">3</span>
          <span>Review</span>
        </div>
      </div>

      <section className="session-card guided-card">
        <div className="guided-heading">
          <h1>Guided Reflection</h1>
          <span>Question {questionIndex + 1} of 4</span>
        </div>

        <p className="guided-question">
          {questions[questionIndex].title}
        </p>

        <p className="guided-hint">
          {questions[questionIndex].hint}
        </p>

        <textarea
          className="reflection-textarea"
          placeholder="Write or record your reflection here..."
          value={current.answer}
          onChange={(event) =>
            updateAnswer('answer', event.target.value)
          }
        />

        {showFollowUp && (
          <div className="ai-followup">
            <h2>AI Follow-up</h2>
            <p className="ai-intro">
              Let's explore that a little further.
            </p>

            <p className="ai-question">
  {current.followUpQuestion ||
    'Can you describe a specific moment from your session?'}
</p>

            <textarea
              className="reflection-textarea followup-textarea"
              placeholder="Write your response..."
              value={current.followUp}
              onChange={(event) =>
                updateAnswer('followUp', event.target.value)
              }
            />

            <button
              type="button"
              className="skip-followup"
              onClick={() => {
                if (questionIndex < questions.length - 1) {
                  setQuestionIndex(questionIndex + 1)
                } else {
                  navigate('/reflection/review')
                }
              }}
            >
              Skip follow-up
            </button>
          </div>
        )}

        <p className="reflection-reassurance">
          Take your time. There's no right or wrong answer.
        </p>

        <div className="session-actions">
          <button
            type="button"
            className="back-button"
            onClick={handleBack}
          >
            Back
          </button>

          <button
            type="button"
            className="continue-button"
            onClick={handleContinue}
            disabled={isGenerating}
          >
            {isGenerating
  ? 'Generating follow-up...'
  : questionIndex === 3 && showFollowUp
    ? 'Review →'
    : 'Continue →'}
          </button>
        </div>
      </section>
    </main>
  )
}
