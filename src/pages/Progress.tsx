import { useEffect, useState } from "react";
import "./Progress.css";

type JournalEntry = {
  id: string;
  createdAt: string;
  session: {
    sessionType: string;
    date: string;
    duration: string;
    score: string;
    sessionFocus: string;
  };
  answers: { answer: string; followUp: string }[];
  satisfaction?: number;
};

type ApiReflection = {
  id: number;
  createdAt: string;
  sessionType: string;
  date: string;
  duration: number | null;
  score: string | null;
  sessionFocus: string | null;
  wentWell: string | null;
  struggledWith: string | null;
  doDifferently: string | null;
  nextFocus: string | null;
  wentWellFollowUp: string | null;
  struggledWithFollowUp: string | null;
  doDifferentlyFollowUp: string | null;
  nextFocusFollowUp: string | null;
  satisfaction: number | null;
};

function mapApiReflection(reflection: ApiReflection): JournalEntry {
  return {
    id: String(reflection.id),
    createdAt: reflection.createdAt,
    session: {
      sessionType: reflection.sessionType,
      date: reflection.date,
      duration:
        reflection.duration != null
          ? String(reflection.duration)
          : "",
      score: reflection.score || "",
      sessionFocus: reflection.sessionFocus || "",
    },
    answers: [
      {
        answer: reflection.wentWell || "",
        followUp: reflection.wentWellFollowUp || "",
      },
      {
        answer: reflection.struggledWith || "",
        followUp: reflection.struggledWithFollowUp || "",
      },
      {
        answer: reflection.doDifferently || "",
        followUp: reflection.doDifferentlyFollowUp || "",
      },
      {
        answer: reflection.nextFocus || "",
        followUp: reflection.nextFocusFollowUp || "",
      },
    ],
    satisfaction: reflection.satisfaction ?? undefined,
  };
}

function entryDate(entry: JournalEntry) {
  const date = new Date(`${entry.session?.date || ""}T12:00:00`);
  if (!Number.isNaN(date.getTime())) return date;
  const fallback = new Date(entry.createdAt);
  return Number.isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function weekStart(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - daysSinceMonday);
  return result.getTime();
}

function getReflectionStreak(entries: JournalEntry[]) {
  if (!entries.length) return 0;
  const weeks = new Set(entries.map((entry) => weekStart(entryDate(entry))));
  const today = new Date();
  let cursor = weekStart(today);
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  if (!weeks.has(cursor)) cursor -= oneWeek;
  let streak = 0;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor -= oneWeek;
  }
  return streak;
}

function summarize(text: string, limit = 155) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > limit ? `${clean.slice(0, limit).trimEnd()}…` : clean;
}

function findRecurringAnswer(entries: JournalEntry[], answerIndex: number) {
  // Exact recurring phrases only: no simulated semantic analysis.
  const groups = new Map<string, { text: string; count: number }>();
  for (const entry of entries) {
    const text = entry.answers?.[answerIndex]?.answer?.trim();
    if (!text || text.length < 12) continue;
    const key = text.toLowerCase().replace(/\s+/g, " ");
    const existing = groups.get(key);
    groups.set(key, { text, count: (existing?.count || 0) + 1 });
  }
  return [...groups.values()].sort((a, b) => b.count - a.count)[0];
}

export default function Progress() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  useEffect(() => {
  async function loadReflections() {
    try {
      const response = await fetch('http://localhost:8080/api/reflections', {
  credentials: 'include',
})

      if (!response.ok) {
        throw new Error("Failed to load reflections");
      }

      const data: ApiReflection[] = await response.json();

      setEntries(data.map(mapApiReflection));
    } catch (error) {
      console.error("Error loading progress reflections:", error);
    }
  }

  loadReflections();
}, []);

useEffect(() => {
  if (entries.length === 0) return;

  const challenge =
    findRecurringAnswer(entries, 1)?.count &&
    findRecurringAnswer(entries, 1)!.count > 1
      ? findRecurringAnswer(entries, 1)!.text
      : [...entries]
          .sort((a, b) => entryDate(b).getTime() - entryDate(a).getTime())[0]
          ?.answers?.[1]?.answer?.trim() || "";

  const latestEntry = [...entries].sort(
    (a, b) => entryDate(b).getTime() - entryDate(a).getTime()
  )[0];

  const nextFocus = latestEntry?.answers?.[3]?.answer?.trim() || "";

  if (!challenge && !nextFocus) {
  localStorage.removeItem("afterpadel-recommendation");
  setRecommendation("");
  setRecommendationError("");
  setRecommendationLoading(false);
  return;
}
  const cacheKey = "afterpadel-recommendation";

const historySignature = JSON.stringify(
  [...entries]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((entry) => ({
      id: entry.id,
      session: entry.session,
      answers: entry.answers,
    }))
);

try {
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const saved = JSON.parse(cached);

    if (
      saved.historySignature === historySignature &&
      typeof saved.recommendation === "string"
    ) {
      setRecommendation(saved.recommendation);
      setRecommendationError("");
      setRecommendationLoading(false);
      return;
    }
  }
} catch {
  localStorage.removeItem(cacheKey);
}
  const controller = new AbortController();

  async function loadRecommendation() {
    setRecommendationLoading(true);
    setRecommendationError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/recommendation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challenge, nextFocus }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate recommendation");
      }

      const data: { recommendation: string } = await response.json();

if (controller.signal.aborted) return;

setRecommendation(data.recommendation);

localStorage.setItem(
  cacheKey,
  JSON.stringify({
    historySignature,
    recommendation: data.recommendation,
  })
);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("Recommendation error:", error);
      setRecommendationError(
        "We couldn't generate your recommendation right now."
      );
    } finally {
      if (!controller.signal.aborted) {
        setRecommendationLoading(false);
      }
    }
  }

  loadRecommendation();

  return () => controller.abort();
}, [entries]);

  const ordered = [...entries].sort((a, b) => entryDate(b).getTime() - entryDate(a).getTime());
  const latest = ordered[0];
  const previous = ordered[1];
  const focusAreas = new Set(
    entries.map((entry) => entry.session?.sessionFocus?.trim().toLowerCase()).filter(Boolean)
  );
  const streak = getReflectionStreak(entries);
  const latestStrength = latest?.answers?.[0]?.answer?.trim() || "";
  const latestChallenge = latest?.answers?.[1]?.answer?.trim() || "";
  const previousGoal = previous?.answers?.[3]?.answer?.trim() || "";
  const nextFocus = latest?.answers?.[3]?.answer?.trim() || "";
  const recurringStrength = findRecurringAnswer(entries, 0);
  const recurringChallenge = findRecurringAnswer(entries, 1);
  const recommendationChallenge =
  recurringChallenge && recurringChallenge.count > 1
    ? recurringChallenge.text
    : latestChallenge;
  const rated = [...entries]
    .filter((entry) => typeof entry.satisfaction === "number" && entry.satisfaction >= 1 && entry.satisfaction <= 5)
    .sort((a, b) => entryDate(a).getTime() - entryDate(b).getTime())
    .slice(-6);

  const chartWidth = 520;
  const chartHeight = 135;
  const chartLeft = 18;
  const chartRight = chartWidth - 18;
  const chartTop = 12;
  const chartBottom = chartHeight - 12;
  const chartX = (index: number) =>
    rated.length === 1 ? chartWidth / 2 : chartLeft + (index / (rated.length - 1)) * (chartRight - chartLeft);
  const chartY = (value: number) => chartBottom - ((value - 1) / 4) * (chartBottom - chartTop);
  const chartPoints = rated.map((entry, index) => `${chartX(index)},${chartY(entry.satisfaction!)}`).join(" ");

  return (
    <main className="progress-page">
      <section className="progress-panel">
        <div className="progress-heading">
          <div>
            <h1>Progress</h1>
            <p>A closer look at your development over time.</p>
          </div>
          <span className="progress-period">Your reflection history</span>
        </div>

        {entries.length === 0 ? (
          <div className="progress-empty">
            <h2>Your progress starts with reflection.</h2>
            <p>Save your first reflection to begin seeing your journey here.</p>
          </div>
        ) : (
          <>
            <div className="progress-stats">
              <div className="progress-stat"><strong>{entries.length}</strong><span>Sessions Reflected On</span></div>
              <div className="progress-stat"><strong>{focusAreas.size}</strong><span>Focus Areas Identified</span></div>
              <div className="progress-stat"><strong className="progress-streak-number">{streak}</strong><span>Reflection Streak (weeks)</span></div>
            </div>

            <section className="progress-since progress-section">
              <h2>Since Your Last Reflection</h2>
              <p className="progress-description">Revisit what you wanted to work on and what you reported in your next session.</p>
              {previous ? (
                <div className="progress-comparison">
                  <div className="progress-comparison-block">
                    <h3>Your Previous Goal</h3>
                    <p>{previousGoal || "No goal was recorded in your previous reflection."}</p>
                  </div>
                  <div className="progress-comparison-block">
                    <h3>What Went Well Next</h3>
                    <p>{latestStrength || "No strength was recorded in your latest reflection."}</p>
                  </div>
                  <div className="progress-comparison-block">
                    <h3>What You Found Challenging</h3>
                    <p>{latestChallenge || "No challenge was recorded in your latest reflection."}</p>
                  </div>
                  <p className="progress-comparison-note">These are your own observations, not an independent assessment of your performance.</p>
                </div>
              ) : (
                <p className="progress-no-data">Complete another reflection to compare your sessions.</p>
              )}
            </section>

            <section className="progress-patterns progress-section">
              <h2>Your Development Patterns</h2>
              <div className="progress-pattern-grid">
                <div className="progress-pattern">
                  <h3>Strengths</h3>
                  <strong>{recurringStrength && recurringStrength.count > 1 ? "Repeated positive observation" : "Most recent positive observation"}</strong>
                  <p>{summarize(recurringStrength && recurringStrength.count > 1 ? recurringStrength.text : latestStrength) || "Your strengths will appear as you record more reflections."}</p>
                  {recurringStrength && recurringStrength.count > 1 && <small>Mentioned in {recurringStrength.count} reflections</small>}
                </div>
                <div className="progress-pattern">
                  <h3>Challenges</h3>
                  <strong>{recurringChallenge && recurringChallenge.count > 1 ? "Repeated challenge" : "Most recent challenge"}</strong>
                  <p>{summarize(recurringChallenge && recurringChallenge.count > 1 ? recurringChallenge.text : latestChallenge) || "Your challenges will appear as you record more reflections."}</p>
                  {recurringChallenge && recurringChallenge.count > 1 && <small>Mentioned in {recurringChallenge.count} reflections</small>}
                </div>
              </div>
              <p className="progress-disclaimer">Patterns currently use recorded responses, not an AI assessment of your performance.</p>
            </section>

            
<section className="progress-section">
  <h2>Your Next Focus</h2>

  <p className="progress-description">
    A suggested focus for your next session, based on your reflections.
  </p>

  <div className="progress-comparison">
    <div className="progress-comparison-block">
      <h3>Personalized Recommendation</h3>

      {recommendationLoading ? (
        <p>Generating your recommendation...</p>
      ) : recommendationError ? (
        <p>{recommendationError}</p>
      ) : recommendation ? (
        <p>{recommendation}</p>
      ) : (
        <p>
          Record a challenge or goal in your reflections to receive
          a personalized recommendation.
        </p>
      )}
    </div>

    <p className="progress-comparison-note">
      AI-generated guidance based on your self-reported reflections.
    </p>
  </div>
</section>


            <section className="progress-satisfaction progress-section">
              <div className="progress-chart-heading"><h2>Session Satisfaction</h2><span>Last {rated.length} rated {rated.length === 1 ? "session" : "sessions"}</span></div>
              {rated.length === 0 ? (
                <p className="progress-no-data">Rate a session when saving a reflection to begin tracking satisfaction.</p>
              ) : (
                <div className="progress-line-chart">
                  <div className="progress-chart-grid">{[5, 4, 3, 2, 1].map((n) => <span key={n}>{n}/5</span>)}</div>
                  <div className="progress-line-content">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Self-reported session satisfaction from 1 to 5">
                      {rated.length > 1 && <polyline points={chartPoints} fill="none" stroke="#df8754" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
                      {rated.map((entry, index) => (
                        <circle key={entry.id} cx={chartX(index)} cy={chartY(entry.satisfaction!)} r="4.5" fill="#df8754">
                          <title>{formatDate(entryDate(entry))}: {entry.satisfaction}/5</title>
                        </circle>
                      ))}
                    </svg>
                    <div className="progress-line-dates">
                      {rated.map((entry) => <span key={entry.id}>{formatDate(entryDate(entry))}</span>)}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
