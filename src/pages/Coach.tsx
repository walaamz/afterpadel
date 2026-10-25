
import { useEffect, useState } from "react";
import CoachRequestModal from "../components/CoachRequestModal";
import "./Journal.css";
import { Link } from "react-router";

type CoachRequest = {
  requestId: number;
  reflectionId: number;
  sessionType: string;
  date: string;
  shareUrl: string;
  status: "PENDING" | "COMPLETED";
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

export default function Coach() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requests, setRequests] = useState<CoachRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/coach/requests",
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data: CoachRequest[] = await response.json();

        if (!cancelled) {
          setRequests(data);
        }
      } catch (error) {
        console.error("Failed to load coach requests:", error);

        if (!cancelled) {
          setError("Unable to load coach reviews.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [isRequestModalOpen]);

  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING"
  );

  const completedRequests = requests.filter(
    (request) => request.status === "COMPLETED"
  );

  async function handleCancelRequest(requestId: number) {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this coach review request? The private sharing link will stop working."
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/coach/requests/${requestId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    setRequests((previous) =>
      previous.filter((request) => request.requestId !== requestId)
    );
  } catch (error) {
    console.error("Failed to cancel coach request:", error);
    window.alert("Unable to cancel the request. Please try again.");
  }
}

  
return (
  <main className="journal-page coach-page">
    <section className="journal-panel coach-panel">
      <header className="coach-dashboard-header">
        <h1>Coach</h1>

        <button
          type="button"
          className="coach-request-button"
          onClick={() => setIsRequestModalOpen(true)}
        >
          + Request Coach Review
        </button>
      </header>

      <section className="coach-dashboard-section">
        <h2>Pending Reviews</h2>

        {loading ? (
          <p className="coach-empty-message">Loading reviews...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : pendingRequests.length === 0 ? (
          <p className="coach-empty-message">
            No pending reviews yet.
          </p>
        ) : (
          <div className="coach-review-list">
            {pendingRequests.map((request) => (
              <article
                className="coach-review-card"
                key={request.requestId}
              >
                <div className="coach-review-card-info">
                  <h3>{request.sessionType}</h3>
                  <p>{formatDate(request.date)}</p>
                </div>

                <div className="coach-review-card-actions">
                  <span className="coach-status coach-status-pending">
                    Awaiting Feedback
                  </span>

                  <div className="coach-action-links">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            request.shareUrl
                          );
                        } catch {
                          window.alert("Unable to copy the link.");
                        }
                      }}
                    >
                      Share Link
                    </button>

                    <span aria-hidden="true">|</span>

                    <button
                      type="button"
                      onClick={() =>
                        handleCancelRequest(request.requestId)
                      }
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="coach-dashboard-section">
        <h2>Completed Reviews</h2>

        {loading ? (
          <p className="coach-empty-message">Loading reviews...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : completedRequests.length === 0 ? (
          <p className="coach-empty-message">
            No completed reviews yet.
          </p>
        ) : (
          <div className="coach-review-list">
            {completedRequests.map((request) => (
              <article
                className="coach-review-card"
                key={request.requestId}
              >
                <div className="coach-review-card-info">
                  <h3>{request.sessionType}</h3>
                  <p>{formatDate(request.date)}</p>
                  <p className="coach-feedback-available">
                    Coach Feedback Available
                  </p>
                </div>

                <div className="coach-review-card-actions">
                  <span className="coach-status coach-status-completed">
                    Reviewed
                  </span>

                  <Link
                    className="coach-compare-link"
                    to={`/coach/compare/${request.reflectionId}/${request.requestId}`}
                  >
                    Compare Reflections →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>

    {isRequestModalOpen && (
      <CoachRequestModal
        onClose={() => setIsRequestModalOpen(false)}
      />
    )}
  </main>
  );
}
