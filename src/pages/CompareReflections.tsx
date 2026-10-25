
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import "./Journal.css";

type Reflection = {
  id: number;
  sessionType: string;
  date: string;
  wentWell: string | null;
  struggledWith: string | null;
  doDifferently: string | null;
  nextFocus: string | null;
};

type CoachFeedback = {
  requestId: number;
  coachName: string | null;
  wentWellAccuracy: number | null;
  challengesAccuracy: number | null;
  doDifferentlyAccuracy: number | null;
  overallFeelingAccuracy: number | null;
  wentWellComment: string | null;
  challengesComment: string | null;
  doDifferentlyComment: string | null;
  overallFeelingComment: string | null;
  keyTakeaways: string | null;
  recommendedFocus: string | null;
  additionalNotes: string | null;
  submittedAt: string;
};

export default function CompareReflections() {
  const { reflectionId, requestId } = useParams<{
    reflectionId: string;
    requestId: string;
  }>();

  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComparison() {
      try {
        const [reflectionsResponse, feedbackResponse] = await Promise.all([
          fetch("http://localhost:8080/api/reflections", {
            credentials: "include",
          }),
          fetch(
            `http://localhost:8080/api/coach/feedback/${reflectionId}`,
            { credentials: "include" }
          ),
        ]);

        if (!reflectionsResponse.ok || !feedbackResponse.ok) {
          throw new Error("Unable to load comparison.");
        }

        const reflections: Reflection[] = await reflectionsResponse.json();
        const reviews: CoachFeedback[] = await feedbackResponse.json();

        const selectedReflection = reflections.find(
          (item) => item.id === Number(reflectionId)
        );

        const selectedReview = reviews.find(
          (item) => item.requestId === Number(requestId)
        );

        if (!selectedReflection || !selectedReview) {
          throw new Error("Reflection or coach review not found.");
        }

        setReflection(selectedReflection);
        setFeedback(selectedReview);
      } catch (error) {
        console.error("Failed to load comparison:", error);
        setError("Unable to load this coach review.");
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [reflectionId, requestId]);

  if (loading) {
    return <main className="journal-page"><p>Loading comparison...</p></main>;
  }

  if (error || !reflection || !feedback) {
    return (
      <main className="journal-page">
        <section className="journal-panel">
          <h1>Compare Reflections</h1>
          <p role="alert">{error || "Review not found."}</p>
          <Link to="/coach">Back to Coach</Link>
        </section>
      </main>
    );
  }

  const questions = [
    {
      title: "What went well?",
      answer: reflection.wentWell,
      rating: feedback.wentWellAccuracy,
      comment: feedback.wentWellComment,
    },
    {
      title: "What did you struggle with?",
      answer: reflection.struggledWith,
      rating: feedback.challengesAccuracy,
      comment: feedback.challengesComment,
    },
    {
      title: "What would you approach differently?",
      answer: reflection.doDifferently,
      rating: feedback.doDifferentlyAccuracy,
      comment: feedback.doDifferentlyComment,
    },
    {
      title: "What would you focus on next time?",
      answer: reflection.nextFocus,
      rating: feedback.overallFeelingAccuracy,
      comment: feedback.overallFeelingComment,
    },
  ];

  
return (
  <main className="journal-page compare-reflections-page">
    <section className="journal-panel compare-reflections-panel">
      <Link to="/coach" className="compare-back-link">
        ← Back to Coach
      </Link>

      <header className="compare-reflections-header">
        <h1>Compare Reflections</h1>
        <p>
          Compare your post-session reflections with your coach's
          assessment.
        </p>
      </header>

      <section className="compare-session-summary">
        <div>
          <span className="compare-summary-label">Session</span>
          <strong>{reflection.sessionType}</strong>
        </div>

        <div>
          <span className="compare-summary-label">Date</span>
          <strong>
            {new Date(
              `${reflection.date}T00:00:00`
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </strong>
        </div>

        <div>
          <span className="compare-summary-label">Reviewed By</span>
          <strong>{feedback.coachName || "Coach"}</strong>
        </div>
      </section>

      <section className="compare-reflections-questions">
        <h2 className="compare-section-heading">
          Reflection Comparison
        </h2>

        {questions.map((question, index) => (
          <article
            className="compare-reflections-card"
            key={question.title}
          >
            <h3 className="compare-question-title">
              {index + 1}. {question.title}
            </h3>

            <div className="compare-reflections-columns">
              <div className="compare-reflections-player">
                <h4>Your Reflection</h4>
                <p>
                  {question.answer || "No response recorded."}
                </p>
              </div>

              <div className="compare-reflections-coach">
                <div className="compare-coach-heading">
                  <h4>Coach Assessment</h4>

                  <span className="compare-accuracy-badge">
                    {question.rating != null
                      ? `${question.rating}/5 Accuracy`
                      : "Not rated"}
                  </span>
                </div>

                <p>
                  {question.comment ||
                    "No additional comments provided."}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="compare-reflections-overall">
        <h2>Overall Coach Feedback</h2>

        <div className="compare-overall-item">
          <h3>Key Takeaways</h3>
          <p>
            {feedback.keyTakeaways ||
              "No feedback provided."}
          </p>
        </div>

        <div className="compare-overall-item">
          <h3>Recommended Focus</h3>
          <p>
            {feedback.recommendedFocus ||
              "No feedback provided."}
          </p>
        </div>

        <div className="compare-overall-item">
          <h3>Additional Notes</h3>
          <p>
            {feedback.additionalNotes ||
              "No additional notes."}
          </p>
        </div>
      </section>
    </section>
  </main>
);
}
