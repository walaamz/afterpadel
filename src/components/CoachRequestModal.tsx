
import { useEffect, useState } from "react";
import "../pages/Journal.css";

type ApiReflection = {
  id: number;
  sessionType: string;
  date: string;
  duration: number | null;
  score: string | null;
  sessionFocus: string | null;
};

type CoachRequestModalProps = {
  onClose: () => void;
};

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CoachRequestModal({
  onClose,
}: CoachRequestModalProps) {
  const [reflections, setReflections] = useState<ApiReflection[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareError, setShareError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReflections() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/reflections",
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data: ApiReflection[] = await response.json();

        if (!cancelled) {
          setReflections(data);

          if (data.length > 0) {
            setSelectedId(String(data[0].id));
          }
        }
      } catch (error) {
        console.error("Failed to load reflections:", error);

        if (!cancelled) {
          setError("Unable to load your reflections.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReflections();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedReflection = reflections.find(
    (reflection) => String(reflection.id) === selectedId
  );

  async function handleGenerateLink() {
    if (!selectedReflection || isGeneratingLink) return;

    setIsGeneratingLink(true);
    setShareError("");
    setShareUrl("");
    setCopied(false);

    try {
      const response = await fetch(
        `http://localhost:8080/api/coach/share/${selectedReflection.id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: { shareUrl: string } = await response.json();
      setShareUrl(data.shareUrl);
    } catch (error) {
      console.error("Failed to generate coach sharing link:", error);
      setShareError("Unable to generate a private link. Please try again.");
    } finally {
      setIsGeneratingLink(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
      window.alert("Unable to copy the link. Please copy it manually.");
    }
  }

  return (
    <div
      className="journal-modal-overlay coach-request-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="journal-modal coach-request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-request-title"
      >
        <button
          type="button"
          className="journal-modal-close coach-request-close"
          aria-label="Close request"
          onClick={onClose}
        >
          ×
        </button>

        <header className="coach-request-header">
          <h2 id="coach-request-title">Request Coach Review</h2>
          <p>
            Select a reflection from your journal to share with a coach.
            We'll generate a private link you can send for feedback.
          </p>
        </header>

        <div className="coach-request-step">
          <span className="coach-request-step-number">1</span>

          <div className="coach-request-step-content">
            <h3>Select a Reflection</h3>
            <p>Choose a session from your journal.</p>

            {loading ? (
              <p>Loading reflections...</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : reflections.length === 0 ? (
              <p>You haven't saved any reflections yet.</p>
            ) : (
              <select
                className="coach-request-select"
                value={selectedId}
                onChange={(event) => {
                  setSelectedId(event.target.value);
                  setShareUrl("");
                  setShareError("");
                  setCopied(false);
                }}
                aria-label="Select a reflection"
              >
                {reflections.map((reflection) => (
                  <option key={reflection.id} value={reflection.id}>
                    {reflection.sessionType} — {formatDate(reflection.date)}
                    {reflection.duration != null
                      ? ` — ${reflection.duration} min`
                      : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="coach-request-step">
          <span className="coach-request-step-number">2</span>

          <div className="coach-request-step-content">
            <h3>Review Session Details</h3>
            <p>
              This is the session that will be shared with your coach.
            </p>

            {selectedReflection && (
              <div className="coach-session-details">
                <div className="coach-session-detail">
                  <span aria-hidden="true">📅</span>
                  <div>
                    <strong>Date</strong>
                    <p>{formatDate(selectedReflection.date)}</p>
                  </div>
                </div>

                <div className="coach-session-detail">
                  <span aria-hidden="true">⏱</span>
                  <div>
                    <strong>Duration</strong>
                    <p>
                      {selectedReflection.duration != null
                        ? `${selectedReflection.duration} minutes`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="coach-session-detail">
                  <span aria-hidden="true">🎾</span>
                  <div>
                    <strong>Session Type</strong>
                    <p>{selectedReflection.sessionType}</p>
                  </div>
                </div>

                {selectedReflection.sessionFocus && (
                  <div className="coach-session-detail">
                    <span aria-hidden="true">◎</span>
                    <div>
                      <strong>Session Focus</strong>
                      <p>{selectedReflection.sessionFocus}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="coach-request-step">
          <span className="coach-request-step-number">3</span>

          <div className="coach-request-step-content">
            <h3>Generate Private Link</h3>
            <p>
              This link gives your coach access to this specific reflection.
            </p>

            <button
              type="button"
              className="coach-generate-link-button"
              onClick={handleGenerateLink}
              disabled={!selectedReflection || isGeneratingLink}
            >
              {isGeneratingLink
                ? "Generating..."
                : "Generate Private Link"}
            </button>

            {shareError && (
              <p className="coach-request-error" role="alert">
                {shareError}
              </p>
            )}
          </div>
        </div>

        <div className="coach-request-step">
          <span className="coach-request-step-number">4</span>

          <div className="coach-request-step-content">
            <h3>Share with Your Coach</h3>
            <p>
              Copy the link and send it to your coach via WhatsApp,
              email, or another platform.
            </p>

            {shareUrl ? (
              <div className="coach-share-link-row">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  aria-label="Private coach review link"
                  onFocus={(event) => event.target.select()}
                />

                <button
                  type="button"
                  className="coach-copy-link-button"
                  onClick={handleCopyLink}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            ) : (
              <div className="coach-share-link-placeholder">
                Your private link will appear here after generation.
              </div>
            )}

            <div className="coach-request-security-note">
              <span aria-hidden="true">🔒</span>
              <p>
                Anyone with this link can view the selected reflection
                and submit a coach review. Only share it with someone
                you trust. You can cancel a pending request from
                your Coach Dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
