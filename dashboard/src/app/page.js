"use client";
import UniversitySearch from "@/components/UniversitySearch";
import summaryData from "@/data/summary.json";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Background image */}
      <div className="landing-bg">
        <img
          src="/images/pgulbg.avif"
          alt=""
          width={1920}
          height={1080}
        />
      </div>

      {/* Split hero */}
      <div className="landing-hero">
        {/* Left side: text + search */}
        <div className="landing-hero-left">
          <div className="landing-badge">
            <img src="/images/pful.png" alt="Partiful" className="landing-badge-logo" />
            <span>Partiful U</span>
          </div>

          <h1 className="landing-h1">
            your campus,<br />
            <span className="landing-h1-accent">all its events.</span>
          </h1>

          <p className="landing-subtitle">
            Find parties, study groups, club events, and
            everything in between. Scoped to your university.
          </p>

          <div className="landing-search-area">
            <UniversitySearch autoFocus />
          </div>

          {/* Inline stats as floating pills */}
          <div className="landing-pills">
            <div className="landing-pill">
              🎓 <strong>{summaryData.total_universities}</strong> campuses
            </div>
            <div className="landing-pill">
              👥 <strong>{Math.round(summaryData.total_users / 1000)}K</strong> students
            </div>
            <div className="landing-pill">
              🎉 <strong>{Math.round(summaryData.total_events / 1000)}K</strong> events
            </div>
          </div>
        </div>

        {/* Right side: stacked event previews */}
        <div className="landing-hero-right">
          <div className="landing-preview-stack">
            <div className="landing-preview-card lpc-1">
              <img src="/images/colP.webp" alt="" />
              <div className="lpc-label">Friday Night Pregame 🎉</div>
              <div className="lpc-meta">87 going</div>
            </div>
            <div className="landing-preview-card lpc-2">
              <img src="/images/ColP1.jpg" alt="" />
              <div className="lpc-label">End of Finals Blowout</div>
              <div className="lpc-meta">134 going</div>
            </div>
            <div className="landing-preview-card lpc-3">
              <img src="/images/pful.gif" alt="" />
              <div className="lpc-label">Partiful vibes ✨</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
