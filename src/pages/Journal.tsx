import { useEffect, useState } from "react";
import ReflectionModal from "../components/ReflectionModal";
import "./Journal.css";



type Session = {
  sessionType: string
  date: string
  duration: string
  score: string
  sessionFocus: string
}

type Answer = {
  answer: string
  followUp: string
}

type JournalEntry = {
  id: string
  createdAt: string
  session: Session
  answers: Answer[]
  satisfaction?: number
}

const questions = [
  "What went well during your session?",
  "What did you struggle with?",
  "Was there a moment you would approach differently?",
  "What would you like to focus on next time?",
]

const filters = [
  "All",
  "Friendly",
  "Competitive",
  "Tournament",
  "Training",
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


function getEntryDate(entry: JournalEntry) {
  const sessionDate = entry.session?.date;

  if (sessionDate) {
    const parsed = new Date(sessionDate).getTime();

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const createdDate = new Date(entry.createdAt).getTime();
  return Number.isNaN(createdDate) ? 0 : createdDate;
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

export default function Journal() {

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedEntry, setSelectedEntry] =
    useState<JournalEntry | null>(null);


  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("afterpadel-journal") || "[]"
      );

      setEntries(Array.isArray(stored) ? stored : []);
    } catch {
      setEntries([]);
    }
  }, []);

  
const latestEntry = [...entries].sort(
  (a, b) =>
    getEntryDate(b) - getEntryDate(a) ||
    new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
)[0];

const latestEntryId = latestEntry?.id;

  
const filteredEntries = entries
  .filter((entry) => {
    if (activeFilter === "All") return true

    return (entry.session?.sessionType || "")
      .toLowerCase()
      .includes(activeFilter.toLowerCase())
  })
  .filter((entry) => {
    const searchableText = [
      entry.session?.sessionType,
      entry.session?.sessionFocus,
      entry.session?.score,
      ...(entry.answers || []).flatMap((answer) => [
        answer.answer,
        answer.followUp,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    
    return searchableText.includes(search.toLowerCase())
    })
    .sort(
        (a, b) =>
        getEntryDate(b) - getEntryDate(a) ||
        new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
);



  return (
    <main className="journal-page">
      <section className="journal-panel">
        <h1>Journal</h1>

        <input
          className="journal-search"
          type="search"
          placeholder="Search your reflections..."
          aria-label="Search your reflections"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="journal-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={
                activeFilter === filter
                  ? "journal-filter active"
                  : "journal-filter"
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {entries.length === 0 ? (
          <div className="journal-empty">
            <h2>Your journal starts here.</h2>
            <p>
              Once you save your first reflection, you'll be
              able to revisit it here.
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="journal-empty">
            <h2>No matching reflections</h2>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="journal-list">
            {filteredEntries.map((entry) => (
              <article className="journal-entry" key={entry.id}>            
            <div className="journal-entry-top">
                <div className="journal-entry-heading">
                    <h2>{getSessionLabel(entry.session?.sessionType)}</h2>

            {entry.id === latestEntryId && (
            <span className="journal-latest-label">
             Latest
            </span>
    )}
  </div>

  <span>
    {formatDate(entry.session?.date || entry.createdAt)}
  </span>
</div>

            <p className="journal-excerpt">
                {entry.answers?.[0]?.answer
                    ? entry.answers[0].answer.slice(0, 110) +
                     (entry.answers[0].answer.length > 110 ? "..." : "")
        :                "No reflection preview available."}
            </p>


                <div className="journal-entry-bottom">
                  <span>
                    {entry.session?.sessionFocus || "No focus specified"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    View Reflection →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      
<ReflectionModal
  entry={selectedEntry}
  onClose={() => setSelectedEntry(null)}
/>
    </main>
  );
}
