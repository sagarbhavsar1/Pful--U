"use client";
import UniversitySearch from "@/components/UniversitySearch";

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

      {/* Top banner with Partiful U branding */}
      <div className="landing-topbar">
        <div className="landing-topbar-brand">
          <img src="/images/pful.png" alt="Partiful" className="landing-topbar-logo" />
          <span className="landing-topbar-name">Partiful U</span>
        </div>
      </div>

      {/* Split hero */}
      <div className="landing-hero">
        {/* Left side: text + search */}
        <div className="landing-hero-left">

          <h1 className="landing-h1">
            Find Events<br />
            <span className="landing-h1-accent">At Your University.</span>
          </h1>

          <p className="landing-subtitle">
            Search your university to see what&#39;s happening this week.
          </p>

          <div className="landing-search-area">
            <UniversitySearch autoFocus />
          </div>
        </div>

        {/* Right side: stacked event previews */}
        <div className="landing-hero-right">
          <div className="landing-preview-stack">
            <div className="landing-preview-card lpc-1">
              <img src="/images/ColP1.jpg" alt="" />
              <div className="lpc-label">End of Finals Blowout 🎓</div>
              <div className="lpc-meta">134 going</div>
            </div>
            <div className="landing-preview-card lpc-2">
              <img src="/images/colP.webp" alt="" />
              <div className="lpc-label">Friday Night Pregame 🎉</div>
              <div className="lpc-meta">87 going</div>
            </div>
            <div className="landing-preview-card lpc-3">
              <img src="/images/pful.gif" alt="" />
              <div className="lpc-label">Partiful Vibes ✨</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="landing-footer">
        <p>
          This is a prototype demo built by <strong>Sagar Bhavsar</strong> to express
          interest in Partiful and demonstrate a working analytics model for a
          Partiful University feature. Made using synthetically generated data.
        </p>
      </div>
    </div>
  );
}
