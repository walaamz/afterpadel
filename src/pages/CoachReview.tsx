
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./Journal.css";
import { useParams } from "react-router";


type SharedReflection = {
  id: number;
  sessionType: string;
  date: string;
  wentWell: string | null;
  struggledWith: string | null;
  doDifferently: string | null;
  nextFocus: string | null;
  satisfaction: number | null;
  duration: number | null;
};

type ReviewQuestion = {
  key: string;
  title: string;
  answer: string | null;
  ratingField:
    | "wentWellAccuracy"
    | "challengesAccuracy"
    | "doDifferentlyAccuracy"
    | "overallFeelingAccuracy";
  commentField:
    | "wentWellComment"
    | "challengesComment"
    | "doDifferentlyComment"
    | "overallFeelingComment";
};

type AccuracyField =
  | "wentWellAccuracy"
  | "challengesAccuracy"
  | "doDifferentlyAccuracy"
  | "overallFeelingAccuracy";

type CommentField =
  | "wentWellComment"
  | "challengesComment"
  | "doDifferentlyComment"
  | "overallFeelingComment";

export default function CoachReview() {
  const { token } = useParams<{ token: string }>();

  const [reflection, setReflection] = useState<SharedReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [coachName, setCoachName] = useState("");

  const [ratings, setRatings] = useState<Record<AccuracyField, number>>({
    wentWellAccuracy: 3,
    challengesAccuracy: 3,
    doDifferentlyAccuracy: 3,
    overallFeelingAccuracy: 3,
  });

  const [comments, setComments] = useState<Record<CommentField, string>>({
    wentWellComment: "",
    challengesComment: "",
    doDifferentlyComment: "",
    overallFeelingComment: "",
  });

  const [keyTakeaways, setKeyTakeaways] = useState("");
  const [recommendedFocus, setRecommendedFocus] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadReflection() {
      if (!token) {
        setError("Invalid sharing link.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/coach/review/${encodeURIComponent(token)}`
        );

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        setReflection(data.reflection);
        setIsSubmitted(data.submitted === true);
      } catch (error) {
        console.error("Unable to load shared reflection:", error);
        setError("This sharing link is invalid or unavailable.");
      } finally {
        setLoading(false);
      }
    }

    loadReflection();
  }, [token]);

  function updateRating(field: AccuracyField, value: number) {
    setRatings((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateComment(field: CommentField, value: string) {
    setComments((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/coach/review/${encodeURIComponent(token)}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coachName: coachName.trim(),
            ...ratings,
            ...comments,
            keyTakeaways,
            recommendedFocus,
            additionalNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit coach feedback:", error);
      setSubmitError("Unable to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="journal-page">
        <p>Loading reflection...</p>
      </main>
    );
  }

  if (error || !reflection) {
    return (
      <main className="journal-page">
        <section className="journal-panel">
          <h1>Coach Review</h1>
          <p role="alert">{error || "Reflection not found."}</p>
        </section>
      </main>
    );
  }

  const questions: ReviewQuestion[] = [
    {
      key: "went-well",
      title: "What went well?",
      answer: reflection.wentWell,
      ratingField: "wentWellAccuracy",
      commentField: "wentWellComment",
    },
    {
      key: "challenges",
      title: "What did you struggle with?",
      answer: reflection.struggledWith,
      ratingField: "challengesAccuracy",
      commentField: "challengesComment",
    },
    {
      key: "do-differently",
      title: "What would you approach differently?",
      answer: reflection.doDifferently,
      ratingField: "doDifferentlyAccuracy",
      commentField: "doDifferentlyComment",
    },
    {
      key: "next-focus",
      title: "What would you focus on next time?",
      answer: reflection.nextFocus,
      ratingField: "overallFeelingAccuracy",
      commentField: "overallFeelingComment",
    },
  ];

  return (
    <main className="journal-page coach-review-page">
      <section className="journal-panel coach-review-panel">
        <header className="coach-review-header">
          <h1>Coach Review</h1>
          <p>
            Review the player's reflections and provide your assessment
            of each response.
          </p>
        </header>

        <section className="coach-review-session">
  <h2>Session Details</h2>

  <div className="coach-review-session-grid">
    <div>
      <strong>Session Type</strong>
      <p>{reflection.sessionType}</p>
    </div>

    <div>
      <strong>Date</strong>
      <p>
        {new Date(`${reflection.date}T00:00:00`).toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        )}
      </p>
    </div>

    <div>
      <strong>Duration</strong>
      <p>
        {reflection.duration != null && reflection.duration > 0
          ? `${reflection.duration} minutes`
          : "Not specified"}
      </p>
    </div>

    <div>
      <strong>Player Satisfaction</strong>
      <p>
        {reflection.satisfaction != null &&
        reflection.satisfaction > 0
          ? `${reflection.satisfaction}/5`
          : "Not rated"}
      </p>
    </div>
  </div>
</section>

        {isSubmitted ? (
          <section className="coach-review-success" role="status">
            <h2>Review Submitted</h2>
            <p>
              Thank you! Feedback has already been submitted for this
              reflection.
            </p>
          </section>
        ) : (
          <form
            className="coach-feedback-form"
            onSubmit={handleSubmitFeedback}
          >
            <section className="coach-review-coach-details">
              <h2>Coach Information</h2>

              <label htmlFor="coach-name">Your Name</label>
              <input
                id="coach-name"
                type="text"
                value={coachName}
                onChange={(event) => setCoachName(event.target.value)}
                placeholder="Enter your name"
                required
              />
            </section>

            <section className="coach-review-questions">
              <h2>Player Reflection</h2>

              {questions.map((question, index) => (
                <article
                  className="coach-review-question-card"
                  key={question.key}
                >
                  <h3>
                    {index + 1}. {question.title}
                  </h3>

                  <div className="coach-review-player-answer">
                    <p className="coach-review-field-label">
                      Player's Response
                    </p>
                    <p>
                      {question.answer || "No response recorded."}
                    </p>
                  </div>

                  <fieldset className="coach-review-accuracy">
                    <legend>
                      How accurate is the player's reflection?
                    </legend>

                    <div className="coach-review-rating-options">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value}>
                          <input
                            type="radio"
                            name={question.ratingField}
                            value={value}
                            checked={
                              ratings[question.ratingField] === value
                            }
                            onChange={() =>
                              updateRating(question.ratingField, value)
                            }
                          />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>

                    <p className="coach-review-rating-hint">
                      1 = Not accurate · 5 = Very accurate
                    </p>
                  </fieldset>

                  <label htmlFor={`${question.key}-comment`}>
                    Coach Feedback (Optional)
                  </label>
                  <textarea
                    id={`${question.key}-comment`}
                    value={comments[question.commentField]}
                    onChange={(event) =>
                      updateComment(
                        question.commentField,
                        event.target.value
                      )
                    }
                    placeholder="Share your observations about this response..."
                    rows={3}
                  />
                </article>
              ))}
            </section>

            <section className="coach-review-overall">
              <h2>Overall Feedback</h2>

              <label htmlFor="coach-key-takeaways">
                Key Takeaways
              </label>
              <textarea
                id="coach-key-takeaways"
                value={keyTakeaways}
                onChange={(event) =>
                  setKeyTakeaways(event.target.value)
                }
                placeholder="What are the main takeaways from this session?"
                rows={4}
              />

              <label htmlFor="coach-recommended-focus">
                Recommended Focus
              </label>
              <textarea
                id="coach-recommended-focus"
                value={recommendedFocus}
                onChange={(event) =>
                  setRecommendedFocus(event.target.value)
                }
                placeholder="What should the player focus on next?"
                rows={4}
              />

              <label htmlFor="coach-additional-notes">
                Additional Notes
              </label>
              <textarea
                id="coach-additional-notes"
                value={additionalNotes}
                onChange={(event) =>
                  setAdditionalNotes(event.target.value)
                }
                placeholder="Any other feedback for the player?"
                rows={4}
              />
            </section>

            {submitError && (
              <p role="alert">{submitError}</p>
            )}

            <button
              type="submit"
              className="coach-review-submit-button"
              disabled={isSubmitting || !coachName.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
