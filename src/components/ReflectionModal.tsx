
import { useEffect, useId, useState } from "react";
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
  onDelete?: (id: string) => Promise<void>;
  onSave?: (entry: ReflectionEntry) => Promise<void>;
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
  onDelete,
  onSave,
}: ReflectionModalProps) {
  const titleId = useId();

  const [isEditing, setIsEditing] = useState(false);
  const [draftEntry, setDraftEntry] = useState<ReflectionEntry | null>(null);
  
  useEffect(() => {
  setIsEditing(false);
  setDraftEntry(null);
}, [entry?.id]);

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
  async function handleDelete() {
  if (!entry || !onDelete) return;

  const confirmed = window.confirm(
    "Are you sure you want to delete this reflection? This action cannot be undone."
  );

  if (!confirmed) return;

  await onDelete(String(entry.id));
}

function handleEdit() {
  if (!entry) return;

  setDraftEntry(structuredClone(entry));
  setIsEditing(true);
}

function handleCancelEdit() {
  setDraftEntry(null);
  setIsEditing(false);
}

function handleAnswerChange(
  index: number,
  field: "answer" | "followUp",
  value: string
) {
  setDraftEntry((previous) => {
    if (!previous) return null;
    return {
      ...previous,
      answers: previous.answers.map((answer, i) =>
        i === index
          ? { ...answer, [field]: value }
          : answer
      ),
    };
  });
}

function handleSessionChange(
  field: keyof ReflectionEntry["session"],
  value: string
) {
  setDraftEntry((previous) => {
    if (!previous) return null;

    return {
      ...previous,
      session: {
        ...previous.session,
        [field]: value,
      },
    };
  });
}

function handleSatisfactionChange(value: number) {
  setDraftEntry((previous) => {
    if (!previous) return null;

    return {
      ...previous,
      satisfaction: value,
    };
  });
}

async function handleSaveChanges() {
  if (!draftEntry || !onSave) return;

  await onSave(draftEntry);

  setIsEditing(false);
  setDraftEntry(null);
}

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

      {onSave && !isEditing && (
  <button
    type="button"
    onClick={handleEdit}
    className="edit-reflection-button"
  >
    Edit Reflection
  </button>
)}

        {onDelete && !isEditing && (
  <button
    type="button"
    onClick={handleDelete}
    className="delete-reflection-button"
  >
    Delete Reflection
  </button>
)}

{isEditing && (
  <button
    type="button"
    onClick={handleSaveChanges}
    className="edit-reflection-button"
  >
    Save Changes
  </button>
)}

{isEditing && (
  <button
    type="button"
    onClick={handleCancelEdit}
    className="cancel-editing-button"
  >
    Cancel Editing
  </button>
)}

        <h2 id={titleId}>
          {getSessionLabel(entry.session?.sessionType)} Reflection
        </h2>

        <p className="journal-modal-date">
          {formatDate(entry.session?.date || entry.createdAt)}
        </p>

        <div className="journal-modal-session">
          <div className="journal-session-info">
  <h3>SESSION DETAILS</h3>

  {isEditing && draftEntry ? (
    <div className="journal-session-edit">

      <label>
        Session Type
        <select
          value={draftEntry.session.sessionType}
          onChange={(event) =>
            handleSessionChange("sessionType", event.target.value)
          }
        >
          <option value="Friendly">Friendly Match</option>
          <option value="Competitive">Competitive Match</option>
          <option value="Tournament">Tournament</option>
          <option value="Training">Training</option>
        </select>
      </label>

      <label>
        Date
        <input
          type="date"
          value={draftEntry.session.date}
          onChange={(event) =>
            handleSessionChange("date", event.target.value)
          }
        />
      </label>

      <label>
        Duration (minutes)
        <input
          type="number"
          min="1"
          value={draftEntry.session.duration || ""}
          onChange={(event) =>
            handleSessionChange("duration", event.target.value)
          }
        />
      </label>

      <label>
        Score
        <input
          type="text"
          value={draftEntry.session.score || ""}
          onChange={(event) =>
            handleSessionChange("score", event.target.value)
          }
        />
      </label>

      <label>
        Session Focus
        <input
          type="text"
          value={draftEntry.session.sessionFocus || ""}
          onChange={(event) =>
            handleSessionChange("sessionFocus", event.target.value)
          }
        />
      </label>

    </div>
  ) : (
    <>
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
    </>
  )}
</div>

          <div className="journal-satisfaction">
            <strong>SESSION SATISFACTION</strong>

            <div
  className="journal-rating-dots"
  aria-label="Session satisfaction rating"
>
  {[1, 2, 3, 4, 5].map((rating) => {
    const currentRating = isEditing
      ? draftEntry?.satisfaction ?? null
      : satisfaction;

    const dotClass =
      currentRating === null
        ? "journal-rating-dot unrated"
        : rating <= currentRating
          ? "journal-rating-dot filled"
          : "journal-rating-dot";

    return isEditing ? (
      <button
        key={rating}
        type="button"
        className={dotClass}
        aria-label={`Rate ${rating} out of 5`}
        aria-pressed={currentRating === rating}
        onClick={() => handleSatisfactionChange(rating)}
      />
    ) : (
      <span key={rating} className={dotClass} />
    );
  })}
</div>

            <small>
  {(() => {
    const rating = isEditing
      ? draftEntry?.satisfaction ?? null
      : satisfaction;

    return rating == null || rating < 1 || rating > 5
      ? "Not rated"
      : `${rating}/5 · ${satisfactionLabels[rating]}`;
  })()}
</small>
          </div>
        </div>

        <div className="journal-modal-answers">
  {(isEditing ? draftEntry?.answers || [] : entry.answers || []).map((answer, index) => (
            <div className="journal-modal-answer" key={index}>
              <h3>
                {index + 1}.{" "}
                {questions[index] || "Reflection question"}
              </h3>

              {isEditing ? (
  <textarea
    className="journal-answer-text"
    value={answer.answer}
    onChange={(event) =>
      handleAnswerChange(index, "answer", event.target.value)
    }
    rows={4}
  />
) : (
  <div className="journal-answer-text">
    {answer.answer || "No response recorded."}
  </div>
)}

  {(isEditing || answer.followUp?.trim()) && (
                <div className="journal-modal-followup">
                <span>AI Follow-up Response</span>

                {isEditing ? (
                  <textarea
                    value={answer.followUp}
                    onChange={(event) =>
                      handleAnswerChange(index, "followUp", event.target.value)
                    }
                    rows={3}
                  />
                ) : (
                  <p>{answer.followUp}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  </div>
);
}