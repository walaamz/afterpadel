
import { useState } from "react";
import "./OnboardingTour.css";

type OnboardingTourProps = {
  onComplete: () => void;
};

const steps = [
  {
    icon: "👋",
    title: "Welcome to AfterPadel!",
    description:
      "Your space to reflect on every match, understand your game, and keep improving one session at a time.",
  },
  {
    icon: "📝",
    title: "Reflect on your matches",
    description:
      "Record what went well, what challenged you, and what you'd like to improve next time.",
  },
  {
    icon: "✨",
    title: "Go deeper with AI",
    description:
      "Get personalized follow-up questions that help you reflect more deeply on your performance.",
  },
  {
    icon: "📈",
    title: "Track your progress",
    description:
      "Revisit your Journal, recognize patterns, and receive personalized recommendations.",
  },
  {
    icon: "🤝",
    title: "Get your coach's perspective",
    description:
      "Share reflections with your coach and compare their feedback with your own assessment.",
  },
  {
    icon: "🎉",
    title: "You're all set!",
    description:
      "Start by reflecting on your latest match and begin building your padel journal.",
  },
];

export default function OnboardingTour({
  onComplete,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  function handleNext() {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((previous) => previous + 1);
    }
  }

  return (
    <div className="onboarding-overlay">
      <div
        className="onboarding-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <div className="onboarding-icon">{step.icon}</div>

        <h2 id="onboarding-title">{step.title}</h2>
        <p>{step.description}</p>

        <div className="onboarding-progress">
          {steps.map((_, index) => (
            <span
              key={index}
              className={
                index === currentStep
                  ? "onboarding-dot active"
                  : "onboarding-dot"
              }
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-secondary"
            onClick={() => {
              if (isFirst) {
                onComplete();
              } else {
                setCurrentStep((previous) => previous - 1);
              }
            }}
          >
            {isFirst ? "Skip tour" : "Back"}
          </button>

          <button
            type="button"
            className="onboarding-primary"
            onClick={handleNext}
          >
            {isLast ? "Let's go!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
