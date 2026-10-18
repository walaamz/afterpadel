
import { useEffect, useId } from "react";
import "../pages/Journal.css";

export type ReflectionEntry = {
  id: string;
  createdAt: string;
  session: {
    sessionType: string;
    date: string;
    duration?: string;
    score?: string;
    sessionFocus?: string;
  };
  answers: {
    answer: string;
    followUp: string;
  }[];
  satisfaction?: number;
};

type ReflectionModalProps = {
  entry: ReflectionEntry | null;
  onClose: () => void;
};

const questions = [
  "What went well during your session?",
  "What did you struggle with?",
  "Was there a moment you would approach differently?",
  "What would you like to focus on next time?",
];

function formatDate(date?: string) {
  if (!date) return "Date not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSessionLabel(type?: string) {
  if (!type) return "Padel Session";

  const normalized = type.toLowerCase();

  if (normalized.includes("friendly")) return "Friendly Match";
  if (normalized.includes("competitive")) return "Competitive Match";
  if (normalized.includes("tournament")) return "Tournament";
  if (normalized.includes("training")) return "Training";

  return type;
}

const satisfactionLabels = [
  "",
  "Very dissatisfied",
  "Dissatisfied",
  "Neutral",
  "Satisfied",
  "Very satisfied",
];

export default function ReflectionModal({
  entry,
  onClose,
}: ReflectionModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!entry) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [entry, onClose]);

  if (!entry) return null;

  const satisfaction =
    typeof entry.satisfaction === "number" &&
    entry.satisfaction >= 1 &&
    entry.satisfaction <= 5
      ? entry.satisfaction
      : null;

  return (
    <div
      className="journal-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="journal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="journal-modal-close"
          type="button"
          aria-label="Close reflection"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id={titleId}>
          {getSessionLabel(entry.session?.sessionType)} Reflection
        </h2>

        <p className="journal-modal-date">
          {formatDate(entry.session?.date || entry.createdAt)}
        </p>

        <div className="journal-modal-session">
          <div className="journal-session-info">
            <h3>SESSION DETAILS</h3>

            <p>
              {getSessionLabel(entry.session?.sessionType)}
              {entry.session?.duration
                ? ` · ${entry.session.duration} minutes`
                : ""}
            </p>

            {entry.session?.score && (
              <p>Score: {entry.session.score}</p>
            )}

            <p>
              Focus: {entry.session?.sessionFocus || "Not specified"}
            </p>
          </div>

          <div className="journal-satisfaction">
            <strong>SESSION SATISFACTION</strong>

            <div className="journal-rating-dots" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((rating) => (
                <span
                  key={rating}
                  className={
                    satisfaction === null
                      ? "journal-rating-dot unrated"
                      : rating <= satisfaction
                        ? "journal-rating-dot filled"
                        : "journal-rating-dot"
                  }
                />
              ))}
            </div>

            <small>
              {satisfaction === null
                ? "Not rated"
                : `${satisfaction}/5 · ${satisfactionLabels[satisfaction]}`}
            </small>
          </div>
        </div>

        <div className="journal-modal-answers">
          {(entry.answers || []).map((answer, index) => (
            <div className="journal-modal-answer" key={index}>
              <h3>
                {index + 1}.{" "}
                {questions[index] || "Reflection question"}
              </h3>

              <div className="journal-answer-text">
                {answer.answer || "No response recorded."}
              </div>

              {answer.followUp?.trim() && (
                <div className="journal-modal-followup">
                  <span>AI Follow-up Response</span>
                  <p>{answer.followUp}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
