"use client";
import UniversitySearch from "@/components/UniversitySearch";
import summaryData from "@/data/summary.json";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Background */}
      <div className="landing-bg">
        <img
          src="/images/hero-bg.png"
          alt=""
          width={1920}
          height={1080}
        />
      </div>

      {/* Content */}
      <div className="landing-content">
        {/* Logo */}
        <div className="landing-logo">
          <div className="landing-logo-icon">P</div>
          <div className="landing-logo-text">
            <h1>Partiful U</h1>
            <span>Campus Event Discovery</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="landing-headline">
          Discover what&apos;s happening on{" "}
          <span className="highlight">your campus</span>
        </h2>

        <p className="landing-subheadline">
          Find parties, study groups, club events, and everything in between —
          all in one place, scoped to your university.
        </p>

        {/* Search */}
        <UniversitySearch autoFocus />

        {/* Stats */}
        <div className="landing-stats">
          <div className="landing-stat">
            <div className="landing-stat-value">
              {summaryData.total_universities}
            </div>
            <div className="landing-stat-label">Campuses</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-value">
              {Math.round(summaryData.total_users / 1000)}K
            </div>
            <div className="landing-stat-label">Students</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-value">
              {Math.round(summaryData.total_events / 1000)}K
            </div>
            <div className="landing-stat-label">Events</div>
          </div>
        </div>
      </div>
    </div>
  );
}
