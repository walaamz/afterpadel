
import { useState } from "react";
import ReflectionModal from "../components/ReflectionModal";
import "./Profile.css";


type JournalEntry = {
  id: string;
  createdAt: string;
  session: {
    sessionType: string;
    date: string;
  };
  answers: {
    answer: string;
    followUp: string;
  }[];
};

const milestones = [
  { name: "First Step", required: 1 },
  { name: "Finding Rhythm", required: 3 },
  { name: "Building a Habit", required: 5 },
  { name: "Looking Back", required: 10 },
  { name: "Staying Curious", required: 15 },
];

const levels = [
  { name: "Getting Started", minimum: 0 },
  { name: "Thoughtful Reflector", minimum: 3 },
  { name: "Consistent Reflector", minimum: 8 },
  { name: "Dedicated Reflector", minimum: 15 },
  { name: "Reflection Champion", minimum: 25 },
];

function loadReflections(): JournalEntry[] {
  try {
    const stored = JSON.parse(
      localStorage.getItem("afterpadel-journal") || "[]"
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function getWeeklyMemory(reflections: JournalEntry[]) {
  const now = new Date();

  // Prefer reflections from at least 7 days ago.
  const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  const candidates = reflections.flatMap((entry) => {
    const sessionTime = new Date(
      entry.session?.date || entry.createdAt
    ).getTime();

    return (entry.answers || [])
      .map((answer, index) => ({
        entry,
        answerIndex: index,
        text: answer.answer?.trim() || "",
        sessionTime,
      }))
      .filter(
        (candidate) =>
          candidate.text.length >= 40 &&
          candidate.text.split(/\s+/).length >= 7
      );
  });

  if (candidates.length === 0) {
    return null;
  }

  const olderCandidates = candidates.filter(
    (candidate) =>
      Number.isFinite(candidate.sessionTime) &&
      candidate.sessionTime < oneWeekAgo
  );

  const eligible =
    olderCandidates.length > 0 ? olderCandidates : candidates;

  // A consistent selection for each calendar week.
  const utcDay = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const weekNumber = Math.floor(
    (utcDay / 86400000 + 3) / 7
  );

  const selectedIndex = weekNumber % eligible.length;

  return eligible[selectedIndex];
}

export default function Profile() {
  const [reflections] = useState(loadReflections);
  const [selectedReflection, setSelectedReflection] =
  useState<JournalEntry | null>(null);

  
const [isEditing, setIsEditing] = useState(false);

const [profile, setProfile] = useState(() => {
  try {
    const saved = localStorage.getItem("afterpadel-profile");

    return saved
      ? JSON.parse(saved)
      : {
          username: "User123",
          experience: "Novice",
        };
  } catch {
    return {
      username: "User123",
      experience: "Novice",
    };
  }
});

const [draftProfile, setDraftProfile] = useState({ ...profile });

function handleEdit() {
  setDraftProfile({ ...profile });
  setIsEditing(true);
}

function handleCancel() {
  setDraftProfile({ ...profile });
  setIsEditing(false);
}

function handleSave() {
  const username = draftProfile.username.trim();

  if (!username) {
    return;
  }

  const updatedProfile = {
    username,
    experience: draftProfile.experience,
  };

  localStorage.setItem(
    "afterpadel-profile",
    JSON.stringify(updatedProfile)
  );

  setProfile(updatedProfile);
  setIsEditing(false);
}


  const reflectionCount = reflections.length;

  const currentLevelIndex = levels.reduce(
    (index, level, currentIndex) =>
      reflectionCount >= level.minimum ? currentIndex : index,
    0
  );

  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];

  const progress = nextLevel
    ? ((reflectionCount - currentLevel.minimum) /
        (nextLevel.minimum - currentLevel.minimum)) *
      100
    : 100;

  const earnedMilestones = milestones.filter(
    (milestone) => reflectionCount >= milestone.required
  ).length;

  const memorableMoment = getWeeklyMemory(reflections);

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <h1>Profile</h1>

        <div className="profile-content">
          
<div className="profile-identity">
  <div className="profile-avatar" aria-hidden="true">
    {profile.username.slice(0, 2).toUpperCase()}
  </div>

  {isEditing ? (
    <div className="profile-edit-fields">
      <label htmlFor="profile-username">Username</label>
      <input
        id="profile-username"
        type="text"
        maxLength={30}
        value={draftProfile.username}
        onChange={(event) =>
          setDraftProfile({
            ...draftProfile,
            username: event.target.value,
          })
        }
      />

      <label htmlFor="profile-experience">
        Padel Experience
      </label>
      <select
        id="profile-experience"
        value={draftProfile.experience}
        onChange={(event) =>
          setDraftProfile({
            ...draftProfile,
            experience: event.target.value,
          })
        }
      >
        <option value="Novice">Novice</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="Competitive">Competitive</option>
      </select>
    </div>
  ) : (
    <div>
      <h2>{profile.username}</h2>
      <p>{profile.experience} Padel Player</p>
    </div>
  )}

  <div className="profile-edit-actions">
    {isEditing ? (
      <>
        <button
          type="button"
          onClick={handleSave}
          className="profile-save-button"
          disabled={!draftProfile.username.trim()}
        >
          Save
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="profile-cancel-button"
        >
          Cancel
        </button>
      </>
    ) : (
      <button
        type="button"
        onClick={handleEdit}
        className="profile-edit-button"
      >
        ✎ Edit Profile
      </button>
    )}
  </div>
</div>


          <section className="profile-section">
            <h3>Your Reflection Journey</h3>

            <div className="profile-level-details">
              <strong>
                Level {currentLevelIndex + 1} · {currentLevel.name}
              </strong>

              <span>
                {nextLevel
                  ? `${reflectionCount} / ${nextLevel.minimum}`
                  : `${reflectionCount} reflections`}
              </span>
            </div>

            <div
              className="profile-progress-track"
              role="progressbar"
              aria-label="Progress toward next reflection level"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="profile-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="profile-progress-note">
              {nextLevel
                ? `${nextLevel.minimum - reflectionCount} more saved reflections to reach Level ${currentLevelIndex + 2}.`
                : "You've reached the highest reflection level!"}
            </p>
          </section>

          <section className="profile-section">
            <div className="profile-section-heading">
              <h3>Your Milestones</h3>
              <span>
                {earnedMilestones} / {milestones.length} earned
              </span>
            </div>

            <div className="profile-milestones">
              {milestones.map((milestone) => {
                const unlocked =
                  reflectionCount >= milestone.required;

                return (
                  <div
                    className="profile-milestone"
                    key={milestone.name}
                  >
                    <div
                      className={
                        unlocked
                          ? "profile-milestone-icon unlocked"
                          : "profile-milestone-icon locked"
                      }
                      title={`${milestone.required} saved reflections`}
                    >
                      {unlocked ? "✓" : "○"}
                    </div>

                    <span>{milestone.name}</span>

                    <small>
                      {milestone.required}{" "}
                      {milestone.required === 1
                        ? "reflection"
                        : "reflections"}
                    </small>
                  </div>
                );
              })}
            </div>
          </section>

          
<section className="profile-section">
  <h3>A Moment Worth Remembering</h3>

  {memorableMoment ? (
    <>
      <div className="profile-memory">
        <p className="profile-memory-quote">
          “{memorableMoment.text}”
        </p>

        <span className="profile-memory-source">
          From your reflection ·{" "}
          {new Date(
            memorableMoment.entry.session?.date ||
              memorableMoment.entry.createdAt
          ).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      
<button
  type="button"
  className="profile-memory-link"
  onClick={() =>
    setSelectedReflection(memorableMoment.entry)
  }
>
  Revisit this reflection →
</button>

    </>
  ) : (
    <div className="profile-memory profile-memory-empty">
      As you write more reflections, a moment from your
      past sessions will appear here.
    </div>
  )}
      </section> 
    </div>       
  </section>
   <ReflectionModal
    entry={selectedReflection}
    onClose={() => setSelectedReflection(null)}
  />     
</main>
);
}
