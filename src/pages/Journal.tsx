import { useEffect, useState } from "react";
import ReflectionModal, {
  type ReflectionEntry,
} from "../components/ReflectionModal";
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

export default function Journal() {

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedEntry, setSelectedEntry] =
    useState<JournalEntry | null>(null);


  useEffect(() => {
  async function loadReflections() {
    try {
      const response = await fetch(
  "http://localhost:8080/api/reflections",
  {
    credentials: "include",
  }
);

      if (!response.ok) {
        throw new Error("Failed to load reflections");
      }

      const data: ApiReflection[] = await response.json();

      setEntries(data.map(mapApiReflection));
    } catch (error) {
      console.error("Error loading reflections:", error);
    }
  }

  loadReflections();
}, []);

async function handleDeleteReflection(id: string) {
  try {
    const response = await fetch(
  `http://localhost:8080/api/reflections/${id}`,
  {
    method: "DELETE",
    credentials: "include",
  }
);

    if (!response.ok) {
      throw new Error("Failed to delete reflection");
    }

    setEntries((previousEntries) =>
      previousEntries.filter((entry) => entry.id !== id)
    );

    setSelectedEntry(null);
  } catch (error) {
    console.error("Error deleting reflection:", error);
    window.alert(
      "Unable to delete this reflection. Please try again."
    );
  }
}
  
async function handleSaveReflection(updatedEntry: ReflectionEntry) {
    const payload = {
    sessionType: updatedEntry.session.sessionType,
    date: updatedEntry.session.date,
    duration: updatedEntry.session.duration
      ? Number(updatedEntry.session.duration)
      : null,
    score: updatedEntry.session.score || "",
    sessionFocus: updatedEntry.session.sessionFocus || "",

    wentWell: updatedEntry.answers[0]?.answer || "",
    struggledWith: updatedEntry.answers[1]?.answer || "",
    doDifferently: updatedEntry.answers[2]?.answer || "",
    nextFocus: updatedEntry.answers[3]?.answer || "",

    wentWellFollowUp: updatedEntry.answers[0]?.followUp || "",
    struggledWithFollowUp: updatedEntry.answers[1]?.followUp || "",
    doDifferentlyFollowUp: updatedEntry.answers[2]?.followUp || "",
    nextFocusFollowUp: updatedEntry.answers[3]?.followUp || "",

    satisfaction: updatedEntry.satisfaction ?? null,
  };

  try {
    const response = await fetch(
  `http://localhost:8080/api/reflections/${updatedEntry.id}`,
  {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

    if (!response.ok) {
      throw new Error("Failed to update reflection");
    }

    const savedReflection: ApiReflection = await response.json();
    const savedEntry = mapApiReflection(savedReflection);

    setEntries((previousEntries) =>
      previousEntries.map((entry) =>
        entry.id === savedEntry.id ? savedEntry : entry
      )
    );

    setSelectedEntry(savedEntry);
  } catch (error) {
    console.error("Error updating reflection:", error);
    window.alert("Unable to save changes. Please try again.");
    throw error;
  }
}

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
  onDelete={handleDeleteReflection}
  onSave={handleSaveReflection}
/>
    </main>
  );
}
