import "./WorkPreview.css";

/* WORK PREVIEW — a live-rendered HTML+CSS stand-in for a screenshot.
   Each project picks a `preview` variant in data/projects.json; this file
   is the only place that needs a new `case` if you invent a new one.
   Everything here is decorative (aria-hidden) — the real, accessible
   project info lives in the card's own heading/paragraph markup. */

const clamp = (hex) => (typeof hex === "string" && hex.trim() ? hex : "#7c9cff");

function Frame({ accent, children, dark = false }) {
  return (
    <div
      className={`wp-frame ${dark ? "wp-frame-dark" : ""}`}
      style={{ "--wp-accent": clamp(accent) }}
      aria-hidden="true"
    >
      <div className="wp-bar">
        <span className="wp-dot" />
        <span className="wp-dot" />
        <span className="wp-dot" />
        <span className="wp-url" />
      </div>
      <div className="wp-body">{children}</div>
    </div>
  );
}

/* a small animated line-chart, reused by the dashboard variant */
function SparkChart() {
  return (
    <svg className="wp-spark" viewBox="0 0 120 40" fill="none">
      <path
        className="wp-spark-line"
        d="M2 30 L20 22 L38 26 L56 12 L74 16 L92 6 L118 10"
        stroke="var(--wp-accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="wp-spark-fill"
        d="M2 30 L20 22 L38 26 L56 12 L74 16 L92 6 L118 10 L118 38 L2 38 Z"
        fill="var(--wp-accent)"
      />
    </svg>
  );
}

function EditorPreview({ accent }) {
  return (
    <Frame accent={accent} dark>
      <div className="wp-editor">
        <div className="wp-editor-side">
          <span className="wp-editor-dot" style={{ background: "var(--wp-accent)" }} />
          <span className="wp-editor-dot" />
          <span className="wp-editor-dot" />
          <span className="wp-editor-dot" />
        </div>
        <div className="wp-editor-code">
          <div className="wp-line" style={{ width: "40%" }}>
            <i style={{ background: "#ff6a8b" }} />
          </div>
          <div className="wp-line" style={{ width: "72%" }}>
            <i style={{ background: "var(--wp-accent)" }} />
          </div>
          <div className="wp-line wp-line-indent" style={{ width: "58%" }}>
            <i style={{ background: "#7ee787" }} />
          </div>
          <div className="wp-line wp-line-indent" style={{ width: "66%" }}>
            <i style={{ background: "#e3b341" }} />
          </div>
          <div className="wp-line" style={{ width: "30%" }}>
            <i style={{ background: "#ff6a8b" }} />
          </div>
          <div className="wp-caret" />
        </div>
      </div>
    </Frame>
  );
}

function LandingPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-landing">
        <div className="wp-landing-nav">
          <span className="wp-chip-sm" />
          <span className="wp-chip-sm wp-chip-sm-2" />
          <span className="wp-pill" style={{ background: "var(--wp-accent)" }} />
        </div>
        <div className="wp-landing-hero">
          <span className="wp-line-lg" />
          <span className="wp-line-lg" style={{ width: "60%" }} />
          <span className="wp-cta" style={{ background: "var(--wp-accent)" }} />
        </div>
        <div className="wp-landing-art" style={{ background: "var(--wp-accent)" }} />
      </div>
    </Frame>
  );
}

function DashboardPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-dash">
        <div className="wp-dash-side">
          <span className="wp-dash-item wp-dash-item-on" style={{ background: "var(--wp-accent)" }} />
          <span className="wp-dash-item" />
          <span className="wp-dash-item" />
          <span className="wp-dash-item" />
        </div>
        <div className="wp-dash-main">
          <div className="wp-dash-cards">
            <span className="wp-card-sm" />
            <span className="wp-card-sm" />
            <span className="wp-card-sm" />
          </div>
          <div className="wp-dash-chart">
            <SparkChart />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function QrPreview({ accent }) {
  /* a stylised QR pattern via one repeating conic-gradient, no assets */
  return (
    <Frame accent={accent}>
      <div className="wp-qr-wrap">
        <div className="wp-qr" style={{ "--wp-accent": clamp(accent) }}>
          <span className="wp-qr-eye tl" />
          <span className="wp-qr-eye tr" />
          <span className="wp-qr-eye bl" />
        </div>
        <div className="wp-qr-lines">
          <span className="wp-line-lg" style={{ width: "70%" }} />
          <span className="wp-line-lg" style={{ width: "45%" }} />
          <span className="wp-pill wp-pill-outline" />
        </div>
      </div>
    </Frame>
  );
}

function UploaderPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-upload">
        <div className="wp-upload-zone">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" className="wp-upload-icon">
            <path
              d="M12 16V4M12 4L7 9M12 4l5 5M5 20h14"
              stroke="var(--wp-accent)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="wp-upload-bar">
          <span className="wp-upload-fill" style={{ background: "var(--wp-accent)" }} />
        </div>
        <span className="wp-line-lg" style={{ width: "50%", margin: "0 auto" }} />
      </div>
    </Frame>
  );
}

function ChatPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-chat">
        <div className="wp-bubble wp-bubble-in">
          <span style={{ width: "70%" }} />
          <span style={{ width: "40%" }} />
        </div>
        <div className="wp-bubble wp-bubble-out" style={{ background: "var(--wp-accent)" }}>
          <span style={{ width: "55%", background: "rgba(255,255,255,.55)" }} />
        </div>
        <div className="wp-bubble wp-bubble-in wp-bubble-typing">
          <span className="wp-dot-typing" />
          <span className="wp-dot-typing" />
          <span className="wp-dot-typing" />
        </div>
      </div>
    </Frame>
  );
}

function GridPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="wp-poster"
            style={i === 2 ? { outline: `2px solid var(--wp-accent)`, outlineOffset: "-2px" } : undefined}
          />
        ))}
      </div>
    </Frame>
  );
}

function CalendarPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-cal">
        <div className="wp-cal-head">
          <span className="wp-line-lg" style={{ width: "34%" }} />
        </div>
        <div className="wp-cal-grid">
          {Array.from({ length: 21 }).map((_, i) => (
            <span
              key={i}
              className="wp-cal-cell"
              style={i === 9 ? { background: "var(--wp-accent)" } : undefined}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function QuizPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-quiz">
        <span className="wp-line-lg" style={{ width: "80%" }} />
        <div className="wp-quiz-opt wp-quiz-opt-on" style={{ borderColor: "var(--wp-accent)" }}>
          <i style={{ background: "var(--wp-accent)" }} />
          <span />
        </div>
        <div className="wp-quiz-opt">
          <i />
          <span style={{ width: "60%" }} />
        </div>
        <div className="wp-quiz-opt">
          <i />
          <span style={{ width: "70%" }} />
        </div>
      </div>
    </Frame>
  );
}

function LoginPreview({ accent }) {
  return (
    <Frame accent={accent}>
      <div className="wp-login">
        <span className="wp-login-mark" style={{ background: "var(--wp-accent)" }} />
        <span className="wp-line-lg" style={{ width: "48%" }} />
        <div className="wp-login-field" />
        <div className="wp-login-field" />
        <span className="wp-cta wp-login-cta" style={{ background: "var(--wp-accent)" }} />
      </div>
    </Frame>
  );
}

const VARIANTS = {
  editor: EditorPreview,
  landing: LandingPreview,
  dashboard: DashboardPreview,
  qr: QrPreview,
  uploader: UploaderPreview,
  chat: ChatPreview,
  grid: GridPreview,
  calendar: CalendarPreview,
  quiz: QuizPreview,
  login: LoginPreview,
};

export default function WorkPreview({ variant, accent }) {
  const Variant = VARIANTS[variant];
  if (!Variant) return null;
  return <Variant accent={accent} />;
}
